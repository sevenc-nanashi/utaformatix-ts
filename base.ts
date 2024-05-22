/** @module Lower level functions */
import * as core from "./core.js";
export {
  CannotReadFileException,
  EmptyProjectException,
  IllegalFileException,
  IllegalNotePositionException,
  NotesOverlappingException,
  UnsupportedFileFormatError,
  UnsupportedLegacyPpsfError,
} from "./core.js";
import { JSZip, type UfData } from "./deps.ts";

const createSingleParse = (
  parse: (file: File) => Promise<core.ProjectContainer>,
  ext: string,
): SingleParseFunction =>
async (data): Promise<UfData> => {
  const result = await parse(
    data instanceof File ? data : new File([data], `data.${ext}`),
  );
  const ufData = core.projectToUfData(result);
  return JSON.parse(ufData);
};

const createMultiParse = (
  parse: (files: File[]) => Promise<core.ProjectContainer>,
  ext: string,
): MultiParseFunction =>
async (...data): Promise<UfData> => {
  const files = data.map((d, i) =>
    d instanceof File ? d : new File([d], `data_${i}.${ext}`)
  );
  const result = await parse(files);
  const ufData = core.projectToUfData(result);
  return JSON.parse(ufData);
};

const createSingleGenerate = (
  generate: (project: core.ProjectContainer) => Promise<core.ExportResult>,
): SingleGenerateFunction =>
async (data: UfData): Promise<Uint8Array> => {
  const project = core.ufDataToProject(JSON.stringify(data));
  const result = await generate(project);
  const arrayBuffer = await result.blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

const createUnzip =
  (generate: SingleGenerateFunction) =>
  async (data: UfData): Promise<Uint8Array[]> => {
    const zip = await generate(data);
    const zipReader = new JSZip();
    await zipReader.loadAsync(zip);
    const files = await Promise.all(
      Object.values(zipReader.files).map(
        async (file) =>
          [
            // {project name}_{track id}_{track name}.{ext}
            parseInt(
              file.name.replace(data.project.name + "_", "").split("_")[0],
              10,
            ),
            await file.async("uint8array"),
          ] as const,
      ),
    );
    files.sort(([a], [b]) => a - b);

    return files.map(([, data]) => data);
  };

type SingleParseFunction = (data: Uint8Array | File) => Promise<UfData>;
type MultiParseFunction = (...data: (Uint8Array | File)[]) => Promise<UfData>;
type SingleGenerateFunction = (data: UfData) => Promise<Uint8Array>;
type MultiGenerateFunction = (data: UfData) => Promise<Uint8Array[]>;

// Parse functions

/** Parse ccs (CeVIO's project) file */
export const parseCcs: SingleParseFunction = createSingleParse(
  core.parseCcs,
  "ccs",
);

/** Parse dv (DeepVocal's project) file */
export const parseDv: SingleParseFunction = createSingleParse(
  core.parseDv,
  "dv",
);

/** Parse MusicXML file */
export const parseMusicXml: SingleParseFunction = createSingleParse(
  core.parseMusicXml,
  "musicxml",
);

/** Parse ppsf (Piapro Studio's project) file */
export const parsePpsf: SingleParseFunction = createSingleParse(
  core.parsePpsf,
  "ppsf",
);

/** Parse s5p (Old Synthesizer V's project?) file */
export const parseS5p: SingleParseFunction = createSingleParse(
  core.parseS5p,
  "s5p",
);

/** Parse Standard MIDI file */
export const parseStandardMid: SingleParseFunction = createSingleParse(
  core.parseStandardMid,
  "mid",
);

/** Parse svp (Synthesizer V's project) file */
export const parseSvp: SingleParseFunction = createSingleParse(
  core.parseSvp,
  "svp",
);

/** Parse ust (UTAU's project) file */
export const parseUst: MultiParseFunction = createMultiParse(
  core.parseUst,
  "ust",
);

/** Parse ustx (OpenUtau's project) file */
export const parseUstx: SingleParseFunction = createSingleParse(
  core.parseUstx,
  "ustx",
);

/** Parse Vocaloid 1 MIDI file */
export const parseVocaloidMid: SingleParseFunction = createSingleParse(
  core.parseVocaloidMid,
  "mid",
);

/** Parse vpr (VOCALOID 5's project) file */
export const parseVpr: SingleParseFunction = createSingleParse(
  core.parseVpr,
  "vpr",
);

/** Parse vsq (VOCALOID 2's project) file */
export const parseVsq: SingleParseFunction = createSingleParse(
  core.parseVsq,
  "vsq",
);

/** Parse vsqx (VOCALOID 3/4's project) file */
export const parseVsqx: SingleParseFunction = createSingleParse(
  core.parseVsqx,
  "vsqx",
);

/** Map of extensions to parse functions */
// TODO: Get this from core (model.Format might be useful)
export const parseFunctions: Record<string, SingleParseFunction> = {
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
export const generateCcs: SingleGenerateFunction = createSingleGenerate(
  core.generateCcs,
);

/** Generate dv (DeepVocal's project) file */
export const generateDv: SingleGenerateFunction = createSingleGenerate(
  core.generateDv,
);

/** Generate s5p (Old Synthesizer V's project?) file */
export const generateS5p: SingleGenerateFunction = createSingleGenerate(
  core.generateS5p,
);

/** Generate Standard MIDI file */
export const generateStandardMid: SingleGenerateFunction = createSingleGenerate(
  core.generateStandardMid,
);

/** Generate svp (Synthesizer V's project) file */
export const generateSvp: SingleGenerateFunction = createSingleGenerate(
  core.generateSvp,
);

/** Generate ustx (OpenUtau's project) file */
export const generateUstx: SingleGenerateFunction = createSingleGenerate(
  core.generateUstx,
);

/** Generate Vocaloid 1 MIDI file */
export const generateVocaloidMid: SingleGenerateFunction = createSingleGenerate(
  core.generateVocaloidMid,
);

/** Generate vpr (VOCALOID 5's project) file */
export const generateVpr: SingleGenerateFunction = createSingleGenerate(
  core.generateVpr,
);

/** Generate vsq (VOCALOID 2's project) file */
export const generateVsq: SingleGenerateFunction = createSingleGenerate(
  core.generateVsq,
);

/** Generate vsqx (VOCALOID 3/4's project) file */
export const generateVsqx: SingleGenerateFunction = createSingleGenerate(
  core.generateVsqx,
);

// Multi generate functions

/** Generate ust (UTAU's project) file. Returns an array of ust files, separated by tracks */
export const generateUst: MultiGenerateFunction = createUnzip(
  createSingleGenerate(core.generateUstZip),
);

/** Generate MusicXML file. Returns an array of MusicXML files, separated by tracks */
export const generateMusicXml: MultiGenerateFunction = createUnzip(
  createSingleGenerate(core.generateMusicXmlZip),
);

/**
 * Converts Japanese lyrics.
 * @param data - UtaFormatix data.
 * @param fromType - Type of Japanese lyrics.
 * @param targetType - Type of Japanese lyrics.
 * @param options - Options for conversion.
 */
export const convertJapaneseLyrics = (
  data: UfData,
  fromType: JapaneseLyricsType,
  targetType: JapaneseLyricsType,
  options?: Partial<ConvertJapaneseLyricsOptions>,
): UfData => {
  const { convertVowelConnections = true } = options ?? {};
  const project = core.ufDataToProject(JSON.stringify(data));
  const converted = core.convertJapaneseLyrics(
    project,
    core.JapaneseLyricsType[fromType],
    core.JapaneseLyricsType[targetType],
    convertVowelConnections,
  );
  const ufData = core.projectToUfData(converted);
  return JSON.parse(ufData);
};

/** Options for {@link convertJapaneseLyrics} */
export type ConvertJapaneseLyricsOptions = {
  /** Whether to convert vowel connections. (e.g. "あー" -> "ああ") */
  convertVowelConnections: boolean;
};

/**
 * Analyze the type of Japanese lyrics.
 * @param data - UtaFormatix data.
 * @returns Type of Japanese lyrics.
 */
export const analyzeJapaneseLyricsType = (data: UfData): JapaneseLyricsType => {
  const project = core.ufDataToProject(JSON.stringify(data));
  const type = core.analyzeJapaneseLyricsType(project);
  return type.name as JapaneseLyricsType;
};

/** Type of Japanese lyrics */
export type JapaneseLyricsType =
  | "Unknown"
  | "KanaCv"
  | "KanaVcv"
  | "RomajiCv"
  | "RomajiVcv";

// Make sure the type is correct
// deno-lint-ignore no-constant-condition
if (false) {
  type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends
    <T>() => T extends Y ? 1 : 2 ? true
    : false;

  type Test = Equals<JapaneseLyricsType, core.JapaneseLyricsType["name"]>;
  const _test: Test = true;
}
