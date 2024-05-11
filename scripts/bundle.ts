import { bundle } from "https://deno.land/x/emit@0.40.0/mod.ts";

console.log("-- bundling built.tmp.js");
const result = await bundle("./typescript/built.tmp.js", {
  minify: true,
});

const { code } = result;
await Deno.writeTextFile("./typescript/built.mjs", code);
