kotlin_root = "patched"
task default: %i[copy generate_kt build patch generate_dts generate_readme]

task :copy do
  puts "== Copying UtaFormatix3"
  require "fileutils"

  FileUtils.rm_rf("patched")
  FileUtils.cp_r("utaformatix3", kotlin_root)
end

task :generate_kt, %i[copy] do
  puts "== Generating Main.kt"
  main_kt = +<<~KOTLIN
  import io.*
  import kotlinx.coroutines.GlobalScope
  import kotlinx.coroutines.promise
  import model.ImportParams
  import model.Project
  import model.FeatureConfig
  import model.ExportResult
  import kotlin.js.Promise
  import org.w3c.files.File
  import org.w3c.files.Blob

  const val APP_NAME = "UtaFormatix"
  const val APP_VERSION = "3.21.2"

  @JsExport
  fun exportResultBlob(result: ExportResult): Blob {
    return result.blob
  }
  KOTLIN

  functions = []

  Dir
    .glob(kotlin_root + "/src/jsMain/kotlin/io/*.kt")
    .each do |file|
      content = File.read(file)
      object_name = content.match(/object (\w+)/)[1]
      function_count = functions.length

      if content.include?("fun parse(file: File, params: ImportParams):")
        main_kt << <<~KOTLIN
        @JsExport
        fun #{object_name.downcase}Parse(file: File, params: ImportParams): Promise<Project> {
          return GlobalScope.promise { #{object_name}.parse(file, params) }
        }
        KOTLIN
        functions << "#{object_name.downcase}Parse"
      end
      if content.include?("fun parse(file: File):")
        main_kt << <<~KOTLIN
        @JsExport
        fun #{object_name.downcase}Parse(file: File, params: ImportParams): Promise<Project> {
          return GlobalScope.promise { #{object_name}.parse(file) }
        }
        KOTLIN
        functions << "#{object_name.downcase}Parse"
      end
      if content.include?("fun parse(files: List<File>, params: ImportParams):")
        main_kt << <<~KOTLIN
        @JsExport
        fun #{object_name.downcase}Parse(file: File, params: ImportParams): Promise<Project> {
          return GlobalScope.promise { #{object_name}.parse(listOf(file), params) }
        }
        KOTLIN
        functions << "#{object_name.downcase}Parse"
      end

      if content.match?(
           /fun generate\(project: (model\.)?Project, features: List<FeatureConfig>\):/
         )
        main_kt << <<~KOTLIN
        @JsExport
        fun #{object_name.downcase}Generate(project: Project, features: Array<FeatureConfig>): Promise<ExportResult> {
          return GlobalScope.promise { #{object_name}.generate(project, features.toList()) }
        }
        KOTLIN
        functions << "#{object_name.downcase}Generate"
      end

      if content.match?(/fun generate\(project: (model\.)?Project\):/)
        main_kt << <<~KOTLIN
        @JsExport
        fun #{object_name.downcase}Generate(project: Project, features: Array<FeatureConfig>): Promise<ExportResult> {
          return GlobalScope.promise { #{object_name}.generate(project) }
        }
        KOTLIN
        functions << "#{object_name.downcase}Generate"
      end

      diff = functions.length - function_count
      puts "Found #{functions.length - function_count} functions in #{file}"
    end

  puts "Functions:\n- #{functions.join("\n- ")}"

  File.write(kotlin_root + "/src/jsMain/kotlin/Main.kt", main_kt)
end

task :build, %i[copy generate_kt] do
  puts "== Building UtaFormatix3"
  sh "cd #{kotlin_root} && ./gradlew build -x ktlintJsMainSourceSetCheck -x jsBrowserTest"
end

task :patch, %i[build] do
  puts "== Patching UtaFormatix3 artifacts"
  base = File.read(kotlin_root + "/build/distributions/utaformatix.js")
  start = base.index('("undefined"!=typeof self')
  main =
    <<~JAVASCRIPT + "export default " +
      import {
        DOMParser as xmlDOMParser,
        Document as xmlDocument,
        Element as xmlElement,
        XMLSerializer as xmlXMLSerializer,
      } from 'https://esm.sh/gh/xmldom/xmldom'
      import { File as webStdFile } from 'https://esm.sh/@web-std/file@^3.0.3';
      const patches = {}
      if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
        xmlElement.prototype.insertAdjacentElement = function (position, element) {
          if (position === 'beforebegin') {
            this.parentNode.insertBefore(element, this)
          } else if (position === 'afterbegin') {
            this.insertBefore(element, this.firstChild)
          } else if (position === 'beforeend') {
            this.appendChild(element)
          } else if (position === 'afterend') {
            this.parentNode.insertBefore(element, this.nextSibling)
          }
        }
        patches.DOMParser = xmlDOMParser
        patches.XMLSerializer = xmlXMLSerializer
        patches.Document = xmlDocument
        patches.Element = xmlElement
        patches.XMLDocument = xmlDocument
      }
      if (typeof FileReader === 'undefined') {
        patches.FileReader = class FileReader {
          constructor() {
            this.result = null
            this.onload = null
            this.onloadend = null
          }
          readAsArrayBuffer(file) {
            file.arrayBuffer().then(buffer => {
              this.callback(buffer)
            })
          }
          readAsText(file) {
            file.text().then(text => {
              this.callback(text)
            })
          }
          readAsBinaryString(file) {
            file.arrayBuffer().then(buffer => {
              this.callback(new Uint8Array(buffer).reduce((acc, byte) => acc + String.fromCharCode(byte), ''))
            })
          }

          callback(result) {
            this.result = result
            if (this.onload) {
              this.onload()
            }
            if (this.onloadend) {
              this.onloadend()
            }
            if (!this.onload && !this.onloadend) {
              throw new Error('FileReader.onload or FileReader.onloadend must be set')
            }
          }
        }
      }
      if (typeof File === 'undefined') {
        patches.File = webStdFile
      }

      if (typeof window !== 'undefined') {
        Object.assign(window, patches)
      } else if (typeof global !== 'undefined') {
        Object.assign(global, patches)
      }

      class Option {
        constructor() {}
      }
    JAVASCRIPT
      base[start..-1].sub(%r{;\n//# sourceMappingURL=.+$}, "()")
  File.write("./typescript/built.tmp.js", main)
  sh "deno run -A scripts/bundle.ts"
  File.unlink("./typescript/built.tmp.js")
end

task :generate_dts, %i[generate_kt] do
  puts "== Generating built.d.ts"
  dts = +<<~TYPESCRIPT
  export type ImportParams = {
    simpleImport?: boolean
    multipleMode?: boolean
  }
  export type Project = { __brand: "Project" }
  export type FeatureConfig = { __brand: "FeatureConfig" }
  export type ExportResult = { __brand: "ExportResult" }

  declare function exportResultBlob(result: ExportResult): Blob
  TYPESCRIPT

  functions = []

  main_kt = File.read(kotlin_root + "/src/jsMain/kotlin/Main.kt")

  main_kt.scan(/fun (\w+Parse)\(/) do |m|
    name = m[0]
    dts << <<~TYPESCRIPT
        declare function #{name}(file: File, params: ImportParams): Promise<Project>
        TYPESCRIPT
    functions << name
  end
  main_kt.scan(/fun (\w+Generate)\(/) do |m|
    name = m[0]
    dts << <<~TYPESCRIPT
        declare function #{name}(project: Project, features: FeatureConfig[]): Promise<ExportResult>
        TYPESCRIPT
    functions << name
  end

  dts << <<~TYPESCRIPT
  declare const _default: {
    exportResultBlob: typeof exportResultBlob
    #{functions.map { |f| "#{f}: typeof #{f}" }.join("\n")}
  }
  export default _default
  TYPESCRIPT
  puts "Functions:\n- #{functions.join("\n- ")}"
  File.write("./typescript/built.d.ts", dts)
end

task :generate_readme do
  puts "== Copying README.md"
  FileUtils.cp("README.md", "typescript/README.md")
end

task :test do
  puts "== Test"
  puts "-- Deno"
  sh "cd typescript && deno test -A"
  puts "-- Node"
  sh "deno run -A scripts/dnt.ts"
end
