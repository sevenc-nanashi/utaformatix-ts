> [!NOTE]
> As I'm lazy, I'll write this internal guide in Japanese. Please use DeepL.

# 内部構造

- Gitとかのstatusが残るのが嫌なので、utaformatix3を直にいじらずpatchedディレクトリにコピーしている。（`./tasks.ts copy`）
- Main.ktにこんな感じのコードをioごとに作る（`./tasks.ts generate`）：

```kt
@JsExport
fun ccsParse(file: File, params: ImportParams): Promise<Project> {
  return GlobalScope.promise { Ccs.parse(file, params) }
}

@JsExport
fun ccsGenerate(project: Project, features: Array<FeatureConfig>): Promise<ExportResult> {
  return GlobalScope.promise { Ccs.generate(project, features.toList()) }
}
```

また、ExportResultに色々付けるのが面倒だったので、ExportResult -> Blobの関数も作った。
イメージとしてはwasmでStruct触るときの`(SomeStruct*) -> int`のようなもの。

```kt
@JsExport
fun exportResultBlob(result: ExportResult): Blob {
  return result.blob
}
```

- 型定義も作る（`./tasks.ts generate`）：

```ts
declare function ccsParse(file: File, params: ImportParams): Promise<Project>;
declare function ccsGenerate(
  project: Project,
  features: Array<FeatureConfig>,
): Promise<ExportResult>;
```

- `gradle build` でビルドする。（`./tasks.ts build`）
  - こっちだとWebpackが良い感じにやってくれる。ので`binaries.library()`は使わない。
- JSを強引にパッチする。（`./tasks.ts patch`）
  - DOMParser、Document、Element、XMLSerializer、XMLDocument、FileReaderをpolyfillする。
  - JSZipを使うのに謎のOptionクラスが必要なので、それもpolyfillする。
  - 最初のエクスポート周りをESModuleの形にする。
  - 最後に `deno_emit` で生成したファイルをbundleする。
