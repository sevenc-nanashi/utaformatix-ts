/** @module Lower level functions */
import * as core from "./core.js";
import { JSZip, type UfData } from "./deps.ts";

/** Failed to read the {@link File}. */
export const CannotReadFileException = core.CannotReadFileException;
/** The project is empty. */
export const EmptyProjectException = core.EmptyProjectException;
/** Base class for illegal file exceptions. */
export const IllegalFileException = core.IllegalFileException;
/** Note position is illegal. */
export const IllegalNotePositionException = core.IllegalNotePositionException;
/** Notes are overlapping. */
export const NotesOverlappingException = core.NotesOverlappingException;
/** Unsupported file format. */
export const UnsupportedFileFormatError = core.UnsupportedFileFormatError;
/** Unsupported legacy PPSF file. */
export const UnsupportedLegacyPpsfError = core.UnsupportedLegacyPpsfError;

const uint8ArrayOrFileToFile = (
  data: Uint8Array | File,
  fileName: string,
): File => (data instanceof File ? data : new File([data], fileName));

const parseParamsToImportParams = (params?: Partial<ParseParams>) =>
  new core.ImportParams(!params?.pitch, false, params?.defaultLyric);

const createSingleParse = (
  parse: (
    file: File,
    params: core.ImportParams,
  ) => Promise<core.ProjectContainer>,
  ext: string,
): SingleParseFunction =>
async (data, params): Promise<UfData> => {
  const result = await parse(
    uint8ArrayOrFileToFile(data, `data.${ext}`),
    parseParamsToImportParams(params),
  );
  const ufData = core.projectToUfData(result);
  return JSON.parse(ufData);
};

const createMultiParse = (
  parse: (
    files: File[],
    params: core.ImportParams,
  ) => Promise<core.ProjectContainer>,
  ext: string,
): MultiParseFunction =>
async (data, params): Promise<UfData> => {
  const files = (Array.isArray(data) ? data : [data]).map((d, i) =>
    uint8ArrayOrFileToFile(d, `data_${i}.${ext}`)
  );
  const result = await parse(files, parseParamsToImportParams(params));
  const ufData = core.projectToUfData(result);
  return JSON.parse(ufData);
};

const createSingleGenerate = (
  generate: (
    project: core.ProjectContainer,
    params: core.ConversionParams,
  ) => Promise<core.ExportResult>,
): SingleGenerateFunction =>
async (data, params): Promise<Uint8Array> => {
  const project = core.ufDataToProject(JSON.stringify(data));
  const conversionParams = new core.ConversionParams(params?.pitch);
  const result = await generate(project, conversionParams);
  const arrayBuffer = await result.blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

const createUnzip =
  (generate: SingleGenerateFunction): MultiGenerateFunction =>
  async (data, params): Promise<Uint8Array[]> => {
    const zip = await generate(data, params);
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

type SingleParseFunction = (
  data: Uint8Array | File,
  params?: Partial<ParseParams>,
) => Promise<UfData>;
type MultiParseFunction = (
  data: (Uint8Array | File) | (Uint8Array | File)[],
  params?: Partial<ParseParams>,
) => Promise<UfData>;
type SingleGenerateFunction = (
  data: UfData,
  params?: Partial<GenerateParams>,
) => Promise<Uint8Array>;
type MultiGenerateFunction = (
  data: UfData,
  params?: Partial<GenerateParams>,
) => Promise<Uint8Array[]>;

/** Parse params */
export type ParseParams = {
  /** Whether to read pitches. Default is true. */
  pitch: boolean;
  /** The default lyric. Default is empty string. */
  defaultLyric: string;
};

/** Generate params */
export type GenerateParams = {
  /** Whether to write pitches. Default is false. */
  pitch: boolean;
};

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

/** Parse tssln (VoiSona's project) file */
export const parseTssln: SingleParseFunction = createSingleParse(
  core.parseTssln,
  "tssln",
);

/** Parse ufdata (UtaFormatix data) file */
export const parseUfData: SingleParseFunction = async (data) => {
  const file = uint8ArrayOrFileToFile(data, "data.ufdata");
  const ufData = await file.text();
  const parsed = JSON.parse(ufData);
  return parsed;
};

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
export const parseFunctions: Record<SupportedExtensions, SingleParseFunction> =
  {
    ccs: parseCcs,
    dv: parseDv,
    musicxml: parseMusicXml,
    xml: parseMusicXml,
    ppsf: parsePpsf,
    s5p: parseS5p,
    mid: parseStandardMid,
    svp: parseSvp,
    tssln: parseTssln,
    ufdata: parseUfData,
    ust: parseUst,
    ustx: parseUstx,
    vpr: parseVpr,
    vsq: parseVsq,
    vsqx: parseVsqx,
  };

/** Supported file extensions */
export type SupportedExtensions =
  | "ccs"
  | "dv"
  | "xml"
  | "musicxml"
  | "ppsf"
  | "s5p"
  | "mid"
  | "svp"
  | "tssln"
  | "ufdata"
  | "ust"
  | "ustx"
  | "vpr"
  | "vsq"
  | "vsqx";

/** Supported file extensions */
export const supportedExtensions: SupportedExtensions[] = Object.keys(
  parseFunctions,
) as SupportedExtensions[];

/** Parse a file based on its extension */
export const parseAny = async (
  file: File,
  params?: Partial<ParseParams>,
): Promise<UfData> => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) throw new Error("No file extension");
  const parse = parseFunctions[ext as keyof typeof parseFunctions];
  if (!parse) throw new Error(`No parser found for extension ${ext}`);
  return await parse(file, params);
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

/** Generate tssln (VoiSona's project) file */
export const generateTssln: SingleGenerateFunction = createSingleGenerate(
  core.generateTssln,
);

/** Generate ufdata (UtaFormatix data) file */
export const generateUfData: SingleGenerateFunction = (data) => {
  const project = JSON.stringify(data);
  const buffer = new TextEncoder().encode(project);
  return Promise.resolve(new Uint8Array(buffer));
};

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

/**
 * Type of Japanese lyrics.
 *
 * - `Unknown`: Unknown type.
 * - `KanaCv`: Hiragana/Katakana CV. ("あ", "い", "う")
 * - `KanaVcv`: Hiragana/Katakana VCV. ("- あ", "a い", "i う")
 * - `RomajiCv`: Romaji CV. ("a", "i", "u")
 * - `RomajiVcv`: Romaji VCV. ("- a", "a i", "i u")
 */
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
  true satisfies Equals<JapaneseLyricsType, core.JapaneseLyricsType["name"]>;
}
