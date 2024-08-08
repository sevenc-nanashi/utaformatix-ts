import { removeBreaths } from "./translate.ts";
import { parseUst } from "./base.ts";
import { assertEquals } from "./devDeps.ts";

Deno.test("removeBreaths", async () => {
  const base = await parseUst(
    await Deno.readFile("./testAssets/breath.ust"),
  );

  assertEquals(base.project.tracks[0].notes.length, 4);

  const result = removeBreaths(base.project.tracks[0]);

  assertEquals(result.notes.length, 3);
});
