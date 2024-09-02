import * as uf from "./base.ts";
import {
  assertEquals,
  createCrossTest,
  glob,
  readFile,
} from "./devDeps.ts";
const testAssetsDir = `${import.meta.dirname}/testAssets`;

const crossTest = await createCrossTest(import.meta.url, {
  runtimes: ["deno", "node", "bun"],
});

const parserMap = [
  ["ccs", "parseCcs"],
  ["dv", "parseDv"],
  ["musicxml", "parseMusicXml"],
  ["ppsf", "parsePpsf"],
  ["s5p", "parseS5p"],
  ["standard.mid", "parseStandardMid"],
  ["svp", "parseSvp"],
  ["tssln", "parseTssln"],
  ["ufdata", "parseUfData"],
  ["ust", "parseUst"],
  ["ustx", "parseUstx"],
  ["vocaloid.mid", "parseVocaloidMid"],
  ["vpr", "parseVpr"],
  ["vsq", "parseVsq"],
  ["vsqx", "parseVsqx"],
] as const satisfies [string, keyof typeof uf & `parse${string}`][];

for (const path of await glob("./testAssets/**/*")) {
  const parser = parserMap.find(([ext]) => path.endsWith(ext));
  if (!parser) {
    console.log(`No parser found for ${path}`);
    continue;
  }

  const [, parse] = parser;

  crossTest(`parse: ${path} using ${parse}`, async () => {
    const data = await readFile(path);
    await uf[parse](data);
  });
}

crossTest(
  "generate: MultipleGenerateFunctions can serialize score with correct order",
  async () => {
    const with10Tracks = await readFile(testAssetsDir + "/10tracks.svp");
    const ufdata = await uf.parseSvp(with10Tracks);

    const usts = await uf.generateUst(ufdata);
    const noteNums = usts.map((ust) => {
      const decoded = new TextDecoder().decode(ust);
      const noteNum = decoded.match(/NoteNum=(\d+)/g);
      if (!noteNum) {
        throw new Error("No NoteNum found");
      }
      return parseInt(noteNum[0].split("=")[1]);
    });

    assertEquals(
      noteNums,
      // C4 to D5
      [60, 62, 64, 65, 67, 69, 71, 72, 74, 76],
    );
  },
);

for (
  const name of [
    "generateCcs",
    "generateDv",
    "generateMusicXml",
    "generateStandardMid",
    "generateSvp",
    "generateTssln",
    "generateUfData",
    "generateUst",
    "generateUstx",
    "generateVocaloidMid",
    "generateVpr",
    "generateVsq",
    "generateVsqx",
  ] as const
) {
  crossTest(`generate: ${name}`, async () => {
    const stdMidiData = await readFile(testAssetsDir + "/standard.mid");
    const result = await uf.parseStandardMid(stdMidiData);

    await uf[name](result);
  });
}

crossTest("convertJapaneseLyrics", async () => {
  const cvc = await readFile(testAssetsDir + "/tsukuyomi_vcv.ust");
  const ufdata = await uf.parseUst(cvc);

  const converted = uf.convertJapaneseLyrics(ufdata, "KanaVcv", "KanaCv", {
    convertVowelConnections: true,
  });

  const lyrics = converted.project.tracks[0].notes.map((note) => note.lyric);
  assertEquals(lyrics, ["ど", "れ", "み", "ふぁ", "そ", "ら", "し", "ど"]);
});
