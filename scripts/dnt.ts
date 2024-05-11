import { build, emptyDir } from "jsr:@deno/dnt";
import { copySync } from "jsr:@std/fs/copy";

await emptyDir("./npm");

Deno.chdir("./typescript");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "../npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "your-package",
    version: Deno.args[0],
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
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("../LICENSE", "../npm/LICENSE");
    Deno.copyFileSync("../README.md", "../npm/README.md");
    copySync("./testAssets", "../npm/esm/testAssets");
  },
  scriptModule: false,
});
