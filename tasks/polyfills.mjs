// deno-lint-ignore-file
import {
  Document as xmlDocument,
  DOMParser as xmlDOMParser,
  Element as xmlElement,
  XMLSerializer as xmlXMLSerializer,
} from "@xmldom/xmldom";
import encodingJs from "encoding-japanese";

const patches = {};
if (
  typeof globalThis.DOMParser === "undefined" ||
  typeof globalThis.XMLSerializer === "undefined"
) {
  xmlElement.prototype.insertAdjacentElement = function (position, element) {
    if (position === "beforebegin") {
      this.parentNode.insertBefore(element, this);
    } else if (position === "afterbegin") {
      this.insertBefore(element, this.firstChild);
    } else if (position === "beforeend") {
      this.appendChild(element);
    } else if (position === "afterend") {
      this.parentNode.insertBefore(element, this.nextSibling);
    }
  };
  patches.DOMParser = xmlDOMParser;
  patches.XMLSerializer = xmlXMLSerializer;
  patches.Element = xmlElement;
  patches.XMLDocument = xmlDocument;
}
if (typeof globalThis.FileReader === "undefined") {
  patches.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onload = null;
      this.onloadend = null;
    }
    readAsArrayBuffer(file) {
      file.arrayBuffer().then((buffer) => {
        this.callback(buffer);
      });
    }
    readAsText(file, encoding = "utf-8") {
      file.arrayBuffer().then((buffer) => {
        try {
          const text = new TextDecoder(encoding).decode(buffer);
          this.callback(text);
        } catch (e) {
          // Bun doesn't support shift_jis, so fallback of encoding-japanese is used
          const text = encodingJs.convert(new Uint8Array(buffer), {
            to: "unicode",
            from: encoding,
            type: "string",
          });
          this.callback(text);
        }
      });
    }
    readAsBinaryString(file) {
      file.arrayBuffer().then((buffer) => {
        this.callback(
          new Uint8Array(buffer).reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            "",
          ),
        );
      });
    }

    callback(result) {
      this.result = result;
      if (this.onload) {
        this.onload();
      }
      if (this.onloadend) {
        this.onloadend();
      }
      if (!this.onload && !this.onloadend) {
        throw new Error(
          "FileReader.onload or FileReader.onloadend must be set",
        );
      }
    }
  };
}

const DOMParser = patches.DOMParser || globalThis.DOMParser;
const XMLSerializer = patches.XMLSerializer || globalThis.XMLSerializer;
const Element = patches.Element || globalThis.Element;
const XMLDocument = patches.XMLDocument || globalThis.XMLDocument;
const FileReader = patches.FileReader || globalThis.FileReader;

class Option {
  constructor() {}
}
