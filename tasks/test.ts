import { $, copy, build, emptyDir } from "./deps.ts";

$.setPrintCommand(true);

const testPackageRoot = `${import.meta.dirname}/temporary_test_package`;
const denoRoot = `${import.meta.dirname}/..`;

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
