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

// -- replace --
