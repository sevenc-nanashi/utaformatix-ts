// @deno-types="./built.d.ts"
import raw, {
  type ExportResult,
  type FeatureConfig,
  type ImportParams,
  type Project,
} from "./built.mjs";
import type { UfData } from "npm:utaformatix-data@^1.1.0";
import JSZip from "npm:jszip@^3.10.1";

const createParse =
  (
    parse: (file: File, params: ImportParams) => Promise<Project>,
    ext: string,
  ) =>
  async (data: Uint8Array): Promise<UfData> => {
    const result = await parse(new File([data], `data.${ext}`), {});
    const ufData = await raw.ufdataGenerate(result, []);
    const buffer = await raw.exportResultBlob(ufData).arrayBuffer();
    const decoded = new TextDecoder().decode(new Uint8Array(buffer));
    return JSON.parse(decoded);
  };
const createGenerate =
  (
    generate: (
      project: Project,
      features: FeatureConfig[],
    ) => Promise<ExportResult>,
  ) =>
  async (data: UfData): Promise<Uint8Array> => {
    const buffer = new TextEncoder().encode(JSON.stringify(data));
    const project = await raw.ufdataParse(new File([buffer], "data.json"), {});
    const result = await generate(project, []);
    const blob = raw.exportResultBlob(result);
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };
const createMultiGenerate =
  (generate: (data: UfData) => Promise<Uint8Array>) =>
  async (data: UfData): Promise<Uint8Array[]> => {
    const zip = await generate(data);
    const zipReader = new JSZip();
    await zipReader.loadAsync(zip);
    const files = await Promise.all(
      Object.values(zipReader.files).map(
        async (file) =>
          [
            parseInt(file.name.split("_")[1]),
            await file.async("uint8array"),
          ] as const,
      ),
    );
    files.sort(([a], [b]) => a - b);

    return files.map(([, data]) => data);
  };

export type ParseFunction = (data: Uint8Array) => Promise<UfData>;
export type GenerateFunction = (data: UfData) => Promise<Uint8Array>;
export type MultiGenerateFunction = (data: UfData) => Promise<Uint8Array[]>;

export type { UfData };

// Parse functions

/** Parse ccs (CeVIO's project) file */
export const parseCcs: ParseFunction = createParse(raw.ccsParse, "ccs");

/** Parse dv (DeepVocal's project) file */
export const parseDv: ParseFunction = createParse(raw.dvParse, "dv");

/** Parse MusicXML file */
export const parseMusicXml: ParseFunction = createParse(
  raw.musicxmlParse,
  "musicxml",
);

/** Parse ppsf (Piapro Studio's project) file */
export const parsePpsf: ParseFunction = createParse(raw.ppsfParse, "ppsf");

/** Parse s5p (Old Synthesizer V's project?) file */
export const parseS5p: ParseFunction = createParse(raw.s5pParse, "s5p");

/** Parse Standard MIDI file */
export const parseStandardMid: ParseFunction = createParse(
  raw.standardmidParse,
  "mid",
);

/** Parse svp (Synthesizer V's project) file */
export const parseSvp: ParseFunction = createParse(raw.svpParse, "svp");

/** Parse ust (UTAU's project) file */
export const parseUst: ParseFunction = createParse(raw.ustParse, "ust");

/** Parse ustx (OpenUtau's project) file */
export const parseUstx: ParseFunction = createParse(raw.ustxParse, "ustx");

/** Parse Vocaloid 1 MIDI file */
export const parseVocaloidMid: ParseFunction = createParse(
  raw.vocaloidmidParse,
  "mid",
);

/** Parse vpr (VOCALOID 5's project) file */
export const parseVpr: ParseFunction = createParse(raw.vprParse, "vpr");

/** Parse vsq (VOCALOID 2's project) file */
export const parseVsq: ParseFunction = createParse(raw.vsqParse, "vsq");

/** Parse vsqx (VOCALOID 3/4's project) file */
export const parseVsqx: ParseFunction = createParse(raw.vsqxParse, "vsqx");

/** Map of extensions to parse functions */
export const parseFunctions: Record<string, ParseFunction> = {
  ccs: parseCcs,
  dv: parseDv,
  musicxml: parseMusicXml,
  xml: parseMusicXml,
  ppsf: parsePpsf,
  s5p: parseS5p,
  mid: parseStandardMid,
  svp: parseSvp,
  ust: parseUst,
  ustx: parseUstx,
  vpr: parseVpr,
  vsq: parseVsq,
  vsqx: parseVsqx,
};

/** Parse a file based on its extension */
export const parseAny = async (file: File): Promise<UfData> => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) throw new Error("No file extension");
  const parse = parseFunctions[ext];
  if (!parse) throw new Error(`Unsupported file extension: ${ext}`);
  const buffer = await file.arrayBuffer();
  return parse(new Uint8Array(buffer));
};

// Generate functions

/** Generate ccs (CeVIO's project) file */
export const generateCcs: GenerateFunction = createGenerate(raw.ccsGenerate);

/** Generate dv (DeepVocal's project) file */
export const generateDv: GenerateFunction = createGenerate(raw.dvGenerate);

/** Generate s5p (Old Synthesizer V's project?) file */
export const generateS5p: GenerateFunction = createGenerate(raw.s5pGenerate);

/** Generate Standard MIDI file */
export const generateStandardMid: GenerateFunction = createGenerate(
  raw.standardmidGenerate,
);

/** Generate svp (Synthesizer V's project) file */
export const generateSvp: GenerateFunction = createGenerate(raw.svpGenerate);

/** Generate ustx (OpenUtau's project) file */
export const generateUstx: GenerateFunction = createGenerate(raw.ustxGenerate);

/** Generate Vocaloid 1 MIDI file */
export const generateVocaloidMid: GenerateFunction = createGenerate(
  raw.vocaloidmidGenerate,
);

/** Generate vpr (VOCALOID 5's project) file */
export const generateVpr: GenerateFunction = createGenerate(raw.vprGenerate);

/** Generate vsq (VOCALOID 2's project) file */
export const generateVsq: GenerateFunction = createGenerate(raw.vsqGenerate);

/** Generate vsqx (VOCALOID 3/4's project) file */
export const generateVsqx: GenerateFunction = createGenerate(raw.vsqxGenerate);

// Multi generate functions

/** Generate ust (UTAU's project) file. Returns an array of ust files, separated by tracks */
export const generateUst: MultiGenerateFunction = createMultiGenerate(
  createGenerate(raw.ustGenerate),
);

/** Generate MusicXML file. Returns an array of MusicXML files, separated by tracks */
export const generateMusicXml: MultiGenerateFunction = createMultiGenerate(
  createGenerate(raw.musicxmlGenerate),
);
