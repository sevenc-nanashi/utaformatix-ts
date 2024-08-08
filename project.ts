import { defu, type UfData } from "./deps.ts";
import * as base from "./base.ts";
import * as translate from "./translate.ts";

type BaseProject = UfData["project"];

/**
 * Parameters for parsing.
 *
 * @see {@link base.ParseParams}
 */
export type ParseParams = base.ParseParams & {
  /**
   * Whether to translate software-specific representations.
   *
   * Currently, this option does the following:
   * - `.ust` files: Removes notes with trailing `R`.
   *
   * @see translate.removeBreaths
   * @see translate.replaceVowelConnections
   */
  translateDialect?: boolean;
};

const defaultParseParams: ParseParams = {
  defaultLyric: "",
  pitch: true,
  translateDialect: false,
};

/**
 * Parameters for generation.
 *
 * @see {@link base.GenerateParams}
 */
export type GenerateParams = base.GenerateParams & {
  /**
   * Whether to translate software-specific representations.
   *
   * Currently, this option does the following:
   * - `.ccs` files: Replaces all vowel connections with `ー`.
   * - `.ustx` files: Replaces all vowel connections with `+`.
   *
   * @see translate.replaceVowelConnections
   */
  translateDialect?: boolean;
};

const defaultGenerateParams: GenerateParams = {
  pitch: false,
  translateDialect: false,
};

const baseParse = async <T>(
  parser: (
    data: T,
    params?: Partial<base.ParseParams>,
  ) => Promise<UfData>,
  data: T,
  params?: Partial<ParseParams>,
): Promise<Project> => {
  const resolvedParams = defu(params, defaultParseParams);
  const ufData = await parser(data, {
    defaultLyric: resolvedParams.defaultLyric,
    pitch: resolvedParams.pitch,
  });
  return new Project(ufData);
};

const baseGenerate = async <R>(
  generator: (
    data: UfData,
    params?: Partial<base.GenerateParams>,
  ) => Promise<R>,
  project: Project,
  params?: Partial<GenerateParams>,
): Promise<R> => {
  const resolvedParams = defu(params, defaultGenerateParams);
  return await generator(
    project.toUfDataObject(),
    {
      pitch: resolvedParams.pitch,
    },
  );
};

/**
 * Project data.
 *
 * > [!NOTE]
 * > This class is based on UtaFormatix data (v1).
 * > Please refer to the [UtaFormatix Data Document](https://github.com/sdercolin/utaformatix-data?tab=readme-ov-file#data-structure)
 * > for more information.
 */
export class Project implements BaseProject {
  /** Constructs a new project data from UtaFormatix data. */
  constructor(public data: UfData) {}

  /** Converts the project data to UtaFormatix data. */
  toUfDataObject(): UfData {
    return structuredClone(this.data);
  }

  /**
   * Analyzes the type of Japanese lyrics.
   * @returns Type of Japanese lyrics.
   */
  analyzeJapaneseLyricsType(): base.JapaneseLyricsType {
    return base.analyzeJapaneseLyricsType(this.data);
  }

  /**
   * Converts Japanese lyrics.
   * @param fromType - Type of Japanese lyrics. Use "auto" to automatically detect the type.
   * @param targetType - Type of Japanese lyrics.
   * @param options - Options for conversion.
   */
  convertJapaneseLyrics(
    fromType: base.JapaneseLyricsType | "auto",
    targetType: base.JapaneseLyricsType,
    options?: Partial<base.ConvertJapaneseLyricsOptions>,
  ): Project {
    const ufData = base.convertJapaneseLyrics(
      this.data,
      fromType === "auto" ? this.analyzeJapaneseLyricsType() : fromType,
      targetType,
      options,
    );
    return new Project(ufData);
  }

  /** Removes notes with trailing `R` in all tracks. */
  removeBreaths(): Project {
    const ufData = structuredClone(this.data);
    ufData.project.tracks = ufData.project.tracks.map(translate.removeBreaths);
    return new Project(ufData);
  }

  /**
   * Replaces all vowel connections in all tracks.
   *
   * @param replaceTo - Character to replace vowel connections with.
   */
  replaceVowelConnections(replaceTo: string = "ー"): Project {
    const ufData = structuredClone(this.data);
    ufData.project.tracks = ufData.project.tracks.map((track) =>
      translate.replaceVowelConnections(track, replaceTo)
    );
    return new Project(ufData);
  }

  // Properties

  /** Count of measure prefixes (measures that cannot contain notes, restricted by some editors) */
  get measurePrefix(): BaseProject["measurePrefix"] {
    return this.data.project.measurePrefix;
  }

  /** Project name */
  get name(): BaseProject["name"] {
    return this.data.project.name;
  }

  /** Tempo changes */
  get tempos(): BaseProject["tempos"] {
    return this.data.project.tempos;
  }

  /** Time signature changes */
  get timeSignatures(): BaseProject["timeSignatures"] {
    return this.data.project.timeSignatures;
  }

  /** Tracks */
  get tracks(): BaseProject["tracks"] {
    return this.data.project.tracks;
  }

  // Parsing

  /** Creates a Project instance from ccs (CeVIO's project file) file. */
  static async fromCcs(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return await baseParse(base.parseCcs, data, params);
  }

  /** Creates a Project instance from dv (DeepVocal's project file) file. */
  static async fromDv(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return await baseParse(base.parseDv, data, params);
  }

  /** Creates a Project instance from MusicXML file file. */
  static async fromMusicXml(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return await baseParse(base.parseMusicXml, data, params);
  }

  /** Creates a Project instance from ppsf (Piapro Studio's project file) file. */
  static async fromPpsf(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return await baseParse(base.parsePpsf, data, params);
  }

  /** Creates a Project instance from s5p (Old Synthesizer V's project file) file. */
  static async fromS5p(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return await baseParse(base.parseS5p, data, params);
  }

  /** Creates a Project instance from Standard MIDI file. */
  static async fromStandardMid(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return await baseParse(base.parseStandardMid, data, params);
  }

  /** Creates a Project instance from svp (Synthesizer V's project file) file. */
  static fromSvp(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return baseParse(base.parseSvp, data, params);
  }

  /** Creates a Project instance from tssln (VoiSona's project file) file. */
  static fromTssln(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return baseParse(base.parseTssln, data, params);
  }

  /** Creates a Project instance from ufdata (UtaFormatix data) file. */
  static fromUfData(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return baseParse(base.parseUfData, data, params);
  }

  /** Creates a Project instance from ust (UTAU's project file) file. */
  static async fromUst(
    data: Uint8Array | File | (Uint8Array | File)[],
    params?: Partial<
      ParseParams
    >,
  ): Promise<Project> {
    const project = await baseParse(base.parseUst, data, params);
    if (params?.translateDialect) {
      return project.removeBreaths();
    }
    return project;
  }

  /** Creates a Project instance from ustx (OpenUtau's project file) file. */
  static fromUstx(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return (baseParse(base.parseUstx, data, params));
  }

  /** Creates a Project instance from Vocaloid 1 MIDI file. */
  static fromVocaloidMid(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return baseParse(base.parseVocaloidMid, data, params);
  }

  /** Creates a Project instance from vpr (VOCALOID 5's project file) file. */
  static fromVpr(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return baseParse(base.parseVpr, data, params);
  }

  /** Creates a Project instance from vsq (VOCALOID 2's project file) file. */
  static fromVsq(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return baseParse(base.parseVsq, data, params);
  }

  /** Creates a Project instance from vsqx (VOCALOID 3/4's project file) file. */
  static fromVsqx(
    data: Uint8Array | File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return baseParse(base.parseVsqx, data, params);
  }

  /** Creates a Project instance from file, based on the file extension. */
  static fromAny(
    file: File,
    params?: Partial<ParseParams>,
  ): Promise<Project> {
    return baseParse(base.parseAny, file, params);
  }

  // Generation

  /** Generates ccs (CeVIO's project file) file from the project. */
  toCcs(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    const resolvedParams = defu(params, defaultGenerateParams);
    return baseGenerate(
      base.generateCcs,
      resolvedParams.translateDialect
        ? this.replaceVowelConnections("ー")
        : this,
      params,
    );
  }

  /** Generates dv (DeepVocal's project file) file from the project. */
  toDv(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateDv, this, params);
  }

  /** Generates s5p (Old Synthesizer V's project file) file from the project. */
  toS5p(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateS5p, this, params);
  }

  /** Generates Standard MIDI file from the project. */
  toStandardMid(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateStandardMid, this, params);
  }

  /** Generates svp (Synthesizer V's project file) file from the project. */
  toSvp(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateSvp, this, params);
  }

  /** Generates tssln (VoiSona's project file) file from the project. */
  toTssln(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateTssln, this, params);
  }

  /** Generates ufdata (UtaFormatix data) file from the project. */
  toUfData(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateUfData, this, params);
  }

  /** Generates ustx (OpenUtau's project file) file from the project. */
  toUstx(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    const resolvedParams = defu(params, defaultGenerateParams);
    return baseGenerate(
      base.generateUstx,
      resolvedParams.translateDialect
        ? this.replaceVowelConnections("+")
        : this,
      params,
    );
  }

  /** Generates Vocaloid 1 MIDI file from the project. */
  toVocaloidMid(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateVocaloidMid, this, params);
  }

  /** Generates vpr (VOCALOID 5's project file) file from the project. */
  toVpr(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateVpr, this, params);
  }

  /** Generates vsq (VOCALOID 2's project file) file from the project. */
  toVsq(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateVsq, this, params);
  }

  /** Generates vsqx (VOCALOID 3/4's project file) file from the project. */
  toVsqx(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return baseGenerate(base.generateVsqx, this, params);
  }

  /**
   * Generates ust (UTAU's project file) files from the project.
   * Returns an array of ust files, separated by tracks.
   */
  toUst(params?: Partial<base.GenerateParams>): Promise<Uint8Array[]> {
    return baseGenerate(base.generateUst, this, params);
  }

  /**
   * Generates MusicXML files from the project.
   * Returns an array of MusicXML files, separated by tracks.
   */
  toMusicXml(params?: Partial<base.GenerateParams>): Promise<Uint8Array[]> {
    return baseGenerate(base.generateMusicXml, this, params);
  }
}
