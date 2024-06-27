import type { UfData } from "./deps.ts";
import * as base from "./base.ts";
type BaseProject = UfData["project"];

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
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseCcs(data, params));
  }

  /** Creates a Project instance from dv (DeepVocal's project file) file. */
  static async fromDv(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseDv(data, params));
  }

  /** Creates a Project instance from MusicXML file file. */
  static async fromMusicXml(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseMusicXml(data, params));
  }

  /** Creates a Project instance from ppsf (Piapro Studio's project file) file. */
  static async fromPpsf(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parsePpsf(data, params));
  }

  /** Creates a Project instance from s5p (Old Synthesizer V's project file) file. */
  static async fromS5p(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseS5p(data, params));
  }

  /** Creates a Project instance from Standard MIDI file. */
  static async fromStandardMid(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseStandardMid(data, params));
  }

  /** Creates a Project instance from svp (Synthesizer V's project file) file. */
  static async fromSvp(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseSvp(data, params));
  }

  /** Creates a Project instance from tssln (VoiSona's project file) file. */
  static async fromTssln(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseTssln(data, params));
  }

  /** Creates a Project instance from ufdata (UtaFormatix data) file. */
  static async fromUfData(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseUfData(data, params));
  }

  /** Creates a Project instance from ust (UTAU's project file) file. */
  static async fromUst(
    data: Uint8Array | File | (Uint8Array | File)[],
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseUst(data, params));
  }

  /** Creates a Project instance from ustx (OpenUtau's project file) file. */
  static async fromUstx(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseUstx(data, params));
  }

  /** Creates a Project instance from Vocaloid 1 MIDI file. */
  static async fromVocaloidMid(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseVocaloidMid(data, params));
  }

  /** Creates a Project instance from vpr (VOCALOID 5's project file) file. */
  static async fromVpr(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseVpr(data, params));
  }

  /** Creates a Project instance from vsq (VOCALOID 2's project file) file. */
  static async fromVsq(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseVsq(data, params));
  }

  /** Creates a Project instance from vsqx (VOCALOID 3/4's project file) file. */
  static async fromVsqx(
    data: Uint8Array | File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseVsqx(data, params));
  }

  /** Creates a Project instance from file, based on the file extension. */
  static async fromAny(
    file: File,
    params?: Partial<base.ParseParams>,
  ): Promise<Project> {
    return new Project(await base.parseAny(file, params));
  }

  // Generation

  /** Generates ccs (CeVIO's project file) file from the project. */
  toCcs(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateCcs(this.toUfDataObject(), params);
  }

  /** Generates dv (DeepVocal's project file) file from the project. */
  toDv(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateDv(this.toUfDataObject(), params);
  }

  /** Generates s5p (Old Synthesizer V's project file) file from the project. */
  toS5p(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateS5p(this.toUfDataObject(), params);
  }

  /** Generates Standard MIDI file from the project. */
  toStandardMid(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateStandardMid(this.toUfDataObject(), params);
  }

  /** Generates svp (Synthesizer V's project file) file from the project. */
  toSvp(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateSvp(this.toUfDataObject(), params);
  }

  /** Generates tssln (VoiSona's project file) file from the project. */
  toTssln(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateTssln(this.toUfDataObject(), params);
  }

  /** Generates ufdata (UtaFormatix data) file from the project. */
  toUfData(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateUfData(this.toUfDataObject(), params);
  }

  /** Generates ustx (OpenUtau's project file) file from the project. */
  toUstx(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateUstx(this.toUfDataObject(), params);
  }

  /** Generates Vocaloid 1 MIDI file from the project. */
  toVocaloidMid(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateVocaloidMid(this.toUfDataObject(), params);
  }

  /** Generates vpr (VOCALOID 5's project file) file from the project. */
  toVpr(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateVpr(this.toUfDataObject(), params);
  }

  /** Generates vsq (VOCALOID 2's project file) file from the project. */
  toVsq(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateVsq(this.toUfDataObject(), params);
  }

  /** Generates vsqx (VOCALOID 3/4's project file) file from the project. */
  toVsqx(params?: Partial<base.GenerateParams>): Promise<Uint8Array> {
    return base.generateVsqx(this.toUfDataObject(), params);
  }

  /**
   * Generates ust (UTAU's project file) files from the project.
   * Returns an array of ust files, separated by tracks.
   */
  toUst(params?: Partial<base.GenerateParams>): Promise<Uint8Array[]> {
    return base.generateUst(this.toUfDataObject(), params);
  }

  /**
   * Generates MusicXML files from the project.
   * Returns an array of MusicXML files, separated by tracks.
   */
  toMusicXml(params?: Partial<base.GenerateParams>): Promise<Uint8Array[]> {
    return base.generateMusicXml(this.toUfDataObject(), params);
  }
}
