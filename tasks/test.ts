import { $ } from "./deps.ts";
import { denoRoot } from "./path.ts";

$.setPrintCommand(true);

$.cd(denoRoot);

console.log("Testing on Deno...");
await $`deno test -A`;
// Typecheck README.md
await $`deno test --doc --import-map importMap.test.json README.md`;
