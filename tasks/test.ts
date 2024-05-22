import { $, build, copy, emptyDir } from "./deps.ts";
import { denoRoot, testPackageRoot } from "./path.ts";

$.setPrintCommand(true);

$.cd(denoRoot);

console.log("Testing on Deno...");
await $`deno test -A`;

console.log("Building and testing for npm...");
await emptyDir(testPackageRoot);
await build({
  entryPoints: ["./mod.ts"],
  outDir: testPackageRoot,
  shims: {
    deno: true,
  },
  package: {
    name: "utaformatix",
    version: "0.0.0",
  },
  testPattern: "./*.test.ts",
  async postBuild() {
    await copy("./testAssets", testPackageRoot + "/esm/testAssets");
  },
  scriptModule: false,
});
