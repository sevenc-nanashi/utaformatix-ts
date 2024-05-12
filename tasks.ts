#!/usr/bin/env -S deno run -A
import { $ } from "jsr:@david/dax@^0.41.0";
import { expandGlob, copy as fsCopy } from "jsr:@std/fs@^0.224.0";
import { generate } from "./tasks/generate.ts";
import { patch } from "./tasks/patch.ts";
import { test } from "./tasks/test.ts";

$.setPrintCommand(true);

const clean = async () => {
  if (await Deno.stat("patched").catch(() => null)) {
    await Deno.remove("patched", { recursive: true });
  }
  for await (const entry of expandGlob("./typescript/built.*")) {
    await Deno.remove(entry.path);
  }
};

const copy = async () => {
  await fsCopy("utaformatix3", "patched");

  await fsCopy("./README.md", "typescript/README.md", {
    overwrite: true,
  });
};

const build = async () => {
  $.cd("patched");
  await $`./gradlew jsBrowserProductionWebpack`;
};

const commands: Record<string, () => Promise<void>> = {
  clean,
  copy,
  generate,
  build,
  patch,
  test,
};

const all = async () => {
  const keys = Object.keys(commands).filter((key) => key !== "all");
  for (const command of keys) {
    $.cd(import.meta.dirname!);
    $.logStep(`Running ${command}`);
    await commands[command]();
  }
};
commands.all = all;

if (Deno.args.length === 0) {
  console.log("Usage: ./tasks.ts <commands...>");
  console.log("Available commands:");
  for (const command in commands) {
    console.log(`- ${command}`);
  }
  Deno.exit(1);
}

const invalidCommands = Deno.args.filter((arg) => !commands[arg]);
if (invalidCommands.length > 0) {
  console.log(`Invalid command name(s): ${invalidCommands.join(", ")}`);
  Deno.exit(1);
}

for (const command of Deno.args) {
  $.logStep(`Running ${command}`);
  $.cd(import.meta.dirname!);

  await commands[command]();
}
