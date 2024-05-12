export type ImportParams = {
  simpleImport?: boolean;
  multipleMode?: boolean;
};
export type Project = { __brand: "Project" };
export type FeatureConfig = { __brand: "FeatureConfig" };
export type ExportResult = { __brand: "ExportResult" };

declare function exportResultBlob(result: ExportResult): Blob;

// -- replace --

declare const _default: {
  exportResultBlob: typeof exportResultBlob
  // -- functions --
}
export default _default
