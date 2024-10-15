export * from "../devDeps.ts";
export { copy } from "jsr:@std/fs@^0.224.0";
export { $ } from "jsr:@david/dax@0.41.0";
export { build, emptyDir } from "jsr:@deno/dnt@^0.41.1";
export { SEPARATOR, relative } from "jsr:@std/path@^0.221.0";
export { build as esbuild, type Plugin } from "npm:esbuild@^0.21.2";
export { expandGlob } from "jsr:@std/fs@^0.224.0";
export {
  default as licenseChecker,
  type ModuleInfos,
} from "npm:license-checker-rseidelsohn@^4.3.0";
