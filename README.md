# utaformatix-ts / Unofficial [UtaFormatix3](https://github.com/sdercolin/utaformatix3) port for TypeScript
[![JSR](https://jsr.io/badges/@sevenc-nanashi/utaformatix-ts)](https://jsr.io/@sevenc-nanashi/utaformatix-ts)

This is an **unofficial** [UtaFormatix3](https://github.com/sdercolin/utaformatix3) port for TypeScript.

> [!WARNING]
> This project is made of dirty hacks (It even modifies webpack's output). Use at your own risk.

## Usage

`parse[format]` converts a binary file to [UtaFormatix Data](https://github.com/sdercolin/utaformatix-data).
```typescript
import * as uf from "jsr:@sevenc-nanashi/utaformatix-ts";

const stdMidiData = await Deno.readFile("./standard.mid");
const result: UfData = await uf.parseStandardMid(stdMidiData);

console.log(result); // { formatVersion: 1, project: { ... } }
```

`generate[format]` converts UtaFormatix Data to a binary file.
```typescript
import * as uf from "jsr:@sevenc-nanashi/utaformatix-ts";

const ufdata = JSON.parse(await Deno.readFile("./standard.ufdata.json"))

const midResult: Uint8Array = await uf.generateStandardMid(ufdata);
await Deno.writeFile("./standard.mid", midResult);

const musicXmlResult: Uint8Array[] = await uf.generateMusicXml(ufdata);
await Deno.writeFile("./first_track.musicxml", musicXmlResult[0]);
await Deno.writeFile("./second_track.musicxml", musicXmlResult[1]);
```

## Installation

Please follow [jsr documentation](https://jsr.io/docs/using-packages) for
installation instructions.

```bash
# deno
deno add @sevenc-nanashi/utaformatix-ts

# npm (one of the below, depending on your package manager)
npx jsr add @sevenc-nanashi/utaformatix-ts
yarn dlx jsr add @sevenc-nanashi/utaformatix-ts
pnpm dlx jsr add @sevenc-nanashi/utaformatix-ts
bunx jsr add @sevenc-nanashi/utaformatix-ts
```

## License

This project is licensed under the MIT License, see [LICENSE](https://github.com/sevenc-nanashi/utaformatix-ts/blob/main/LICENSE) for more
information.

## Acknowledgements

This project is based on UtaFormatix3. See [NOTICE.md](https://github.com/sevenc-nanashi/utaformatix-ts/blob/main/NOTICE.md) for more information.
