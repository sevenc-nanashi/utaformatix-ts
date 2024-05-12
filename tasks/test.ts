import { copy } from "jsr:@std/fs@^0.224.0/copy";
import $ from "jsr:@david/dax@^0.41.0";
import { build, emptyDir } from "jsr:@deno/dnt@^0.41.1";

export const test = async () => {
  await emptyDir("./npm");
  $.cd("./typescript");
  $.log("Testing on Deno...");
  await $`deno test -A`;

  $.log("Building and testing for npm...");
  await build({
    entryPoints: ["./mod.ts"],
    outDir: "../npm",
    shims: {
      // see JS docs for overview and more options
      deno: true,
    },
    package: {
      name: "utaformatix-ts",
      version: "0.0.0",
      description: "Your package.",
      license: "MIT",
      repository: {
        type: "git",
        url: "git+https://github.com/username/repo.git",
      },
      bugs: {
        url: "https://github.com/username/repo/issues",
      },
    },
    async postBuild() {
      // steps to run after building and before running the tests
      await Deno.copyFile("../LICENSE", "../npm/LICENSE");
      await Deno.copyFile("../README.md", "../npm/README.md");
      await copy("./testAssets", "../npm/esm/testAssets");
    },
    scriptModule: false,
  });
};
