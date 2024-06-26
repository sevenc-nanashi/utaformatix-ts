import {
  $,
  copy,
  esbuild,
  expandGlob,
  type Plugin,
  relative,
  SEPARATOR,
} from "./deps.ts";
import {
  buildDir,
  modifiedCorePath,
  packageDir,
  resourceDir,
  unbundled,
  utaformatix3Dir,
} from "./path.ts";

$.setPrintCommand(true);

console.log("Building UtaFormatix...");
$.cd(utaformatix3Dir);
if (Deno.build.os === "windows") {
  await $`cmd /c 'gradlew :core:browserProductionLibraryDistribution'`;
} else {
  await $`./gradlew :core:browserProductionLibraryDistribution`;
}

// Copy the package to the temporary directory to modify it
let shouldCopy = false;
if (Deno.args.includes("--force-copy")) {
  console.log("Forced copy");
  await Deno.remove(unbundled, { recursive: true });
  shouldCopy = true;
} else if (await Deno.stat(`${unbundled}/package.json`).catch(() => null)) {
  const unbundledStat = await Deno.stat(`${unbundled}/package.json`);
  const coreStats = await Promise.all(
    [
      ...(await Array.fromAsync(
        expandGlob(`${buildDir}/packages/utaformatix-core/kotlin/**/*`),
      ).then((files) => files.map((x) => x.path))),
      `${buildDir}/packages/utaformatix-core/package.json`,
    ].map((x) => Deno.stat(x)),
  );
  const coreLastModified = Math.max(
    ...coreStats.map((x) => x.mtime?.getTime() ?? 0),
  );
  if (coreLastModified > unbundledStat.mtime!.getTime()) {
    console.log("Core has been modified, copying...");
    await Deno.remove(unbundled, { recursive: true });
    shouldCopy = true;
  } else {
    console.log("Core has not been modified, skipping...");
  }
} else {
  console.log("Core has not been copied, copying...");
  shouldCopy = true;
}
if (shouldCopy) {
  await Deno.mkdir(unbundled, { recursive: true });

  await copy(
    `${buildDir}/packages/utaformatix-core/package.json`,
    `${unbundled}/package.json`,
  );
  await copy(
    `${buildDir}/packages/utaformatix-core/kotlin`,
    `${unbundled}/kotlin`,
  );
}

// Add some polyfills for more portability

// xmldom on npm doesn't export internals such as Document and Element yet, so
// the version on GitHub is used instead
// For later contributors: if xmldom is updated to export these, please update
$.cd(unbundled);
await Deno.writeTextFile(
  `${unbundled}/.npmrc`,
  "@jsr:registry=https://npm.jsr.io",
);
await $`npm install xmldom/xmldom#d55f8a7 stream-browserify@3.0.0`;

const baseCore = await Deno.readTextFile(
  `${unbundled}/kotlin/utaformatix-core.mjs`,
);
await Deno.writeTextFile(
  modifiedCorePath,
  baseCore.replace(
    "//region block: imports",
    await Deno.readTextFile(`${import.meta.dirname}/polyfills.mjs`),
  ),
);

// Make a plugin for esbuild to handle the resources
const resources = await Array.fromAsync(expandGlob(`${resourceDir}/**/*`));
const resourcePlugin: Plugin = {
  name: "resource",
  setup(build) {
    for (const resource of resources) {
      if (resource.path.endsWith(".json")) continue;
      const resourcePath = "./" +
        relative(resourceDir, resource.path).replaceAll(SEPARATOR, "/");
      build.onResolve(
        {
          filter: new RegExp(`^${resourcePath.replaceAll(".", "\\.")}$`),
        },
        () => ({
          path: resource.path,
          namespace: "resource",
        }),
      );
    }
    build.onLoad({ filter: /.*/, namespace: "resource" }, async (args) => ({
      contents: `export default ${
        JSON.stringify(
          await Deno.readTextFile(args.path),
        )
      }`,
    }));
  },
};

console.log("Bundling core...");
await esbuild({
  entryPoints: [modifiedCorePath],
  bundle: true,
  format: "esm",
  outfile: `${packageDir}/core.js`,
  plugins: [resourcePlugin],
  minify: true,
  keepNames: true,
  banner: {
    js: `// deno-lint-ignore-file\n` +
      `/// <reference types="./core.d.ts" />\n`,
  },
  alias: {
    stream: `${unbundled}/node_modules/stream-browserify/index.js`,
  },
});
await copy(
  `${unbundled}/kotlin/utaformatix-core.d.ts`,
  `${packageDir}/core.d.ts`,
  { overwrite: true },
);

console.log("Done!");
