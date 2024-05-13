import { expandGlob } from "jsr:@std/fs@^0.224.0";

export const generate = async () => {
  const codes: string[] = [];
  const parseFunctions: string[] = [];
  const generateFunctions: string[] = [];

  for await (const file of expandGlob("utaformatix3/src/jsMain/kotlin/io/*.kt")) {
    const code = await Deno.readTextFile(file.path);
    const name = code.match(/object (\w+)/)?.[1];
    if (!name) {
      console.warn(`No name found in ${file.path}`);
      continue;
    }

    // Parse
    if (code.includes("fun parse(file: File, params: ImportParams):")) {
      codes.push(`
                 @JsExport
                 fun ${name.toLowerCase()}Parse(file: File, params: ImportParams): Promise<Project> {
                   return GlobalScope.promise { ${name}.parse(file, params) }
                 }
                 `);
      parseFunctions.push(`${name.toLowerCase()}Parse`);
    }
    if (code.includes("fun parse(file: File):")) {
      codes.push(`
                 @JsExport
                 fun ${name.toLowerCase()}Parse(file: File, _unused: ImportParams): Promise<Project> {
                   return GlobalScope.promise { ${name}.parse(file) }
                 }
                 `);
      parseFunctions.push(`${name.toLowerCase()}Parse`);
    }
    if (code.includes("fun parse(files: List<File>, params: ImportParams):")) {
      codes.push(`
                 @JsExport
                 fun ${name.toLowerCase()}Parse(file: File, params: ImportParams): Promise<Project> {
                   return GlobalScope.promise { ${name}.parse(listOf(file), params) }
                 }
                 `);
      parseFunctions.push(`${name.toLowerCase()}Parse`);
    }

    // Generate
    if (
      code.match(
        /fun generate\(project: (model\.)?Project, features: List<FeatureConfig>\):/,
      )
    ) {
      codes.push(`
                 @JsExport
                 fun ${name.toLowerCase()}Generate(project: Project, features: Array<FeatureConfig>): Promise<ExportResult> {
                   return GlobalScope.promise { ${name}.generate(project, features.toList()) }
                 }
                 `);
      generateFunctions.push(`${name.toLowerCase()}Generate`);
    }
    if (code.match(/fun generate\(project: (model\.)?Project\):/)) {
      codes.push(`
                 @JsExport
                 fun ${name.toLowerCase()}Generate(project: Project, features: Array<FeatureConfig>): Promise<ExportResult> {
                   return GlobalScope.promise { ${name}.generate(project) }
                 }
                 `);
      generateFunctions.push(`${name.toLowerCase()}Generate`);
    }
  }

  console.log(
    `Functions:\n- ${parseFunctions.join("\n- ")}\n- ${generateFunctions.join("\n- ")}`,
  );
  await Deno.writeTextFile(
    "patched/src/jsMain/kotlin/Main.kt",
    await Deno.readTextFile(`${import.meta.dirname}/mainBase.kt`).then((base) =>
      base.replace("// -- replace --", codes.join("\n")),
    ),
  );
  await Deno.writeTextFile(
    "typescript/built.d.ts",
    await Deno.readTextFile(`${import.meta.dirname}/builtBase.d.ts`).then(
      (base) =>
        base
          .replace(
            "// -- replace --",
            parseFunctions
              .map(
                (name) =>
                  `declare function ${name}(file: File, params: ImportParams): Promise<Project>;`,
              )
              .join("\n") +
              "\n" +
              generateFunctions
                .map(
                  (name) =>
                    `declare function ${name}(project: Project, features: Array<FeatureConfig>): Promise<ExportResult>;`,
                )
                .join("\n"),
          )
          .replace(
            "// -- functions --",
            parseFunctions.map((name) => `${name}: typeof ${name}`).join("\n") +
              "\n" +
              generateFunctions
                .map((name) => `${name}: typeof ${name}`)
                .join("\n"),
          ),
    ),
  );
};
