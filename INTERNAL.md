> [!NOTE]
> As I'm lazy, I'll write this internal guide in Japanese. Please use DeepL.

# 内部構造

- Gitとかのstatusが残るのが嫌なので、utaformatix3を直にいじらずpatchedディレクトリにコピーしている。（`rake copy`）
- Main.ktにこんな感じのコードをioごとに作る（`rake generate_kt`）：

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

- `gradle build` でビルドする。（`rake build`）
  - こっちだとWebpackが良い感じにやってくれる。ので`binaries.library()`は使わない。
- JSを強引にパッチする。（`rake patch`）
  - DOMParser、Document、Element、XMLSerializer、XMLDocument、FileReaderをpolyfillする。
  - JSZipを使うのに謎のOptionクラスが必要なので、それもpolyfillする。
  - 最初のエクスポート周りをESModuleの形にする。
  - `deno_emit` で生成したファイルをbundleする。
- `d.ts`を生成する。（`rake generate_dts`）
