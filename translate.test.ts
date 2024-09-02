import { removeBreaths } from "./translate.ts";
import { parseUst } from "./base.ts";
import { assertEquals, createCrossTest, readFile } from "./devDeps.ts";

const crossTest = await createCrossTest(import.meta.url, {
  runtimes: ["deno", "node", "bun"],
});

crossTest("removeBreaths", async () => {
  const base = await parseUst(
    await readFile("./testAssets/breath.ust"),
  );

  assertEquals(base.project.tracks[0].notes.length, 4);

  const result = removeBreaths(base.project.tracks[0]);

  assertEquals(result.notes.length, 3);
});
