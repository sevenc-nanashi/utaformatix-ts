# utaformatix-ts / Unofficial Utaformatix3 wrapper for TypeScript

[![JSR](https://jsr.io/badges/@sevenc-nanashi/utaformatix-ts)](https://jsr.io/@sevenc-nanashi/utaformatix-ts)

utaformatix-ts is an unofficial
[UtaFormatix3](https://github.com/sdercolin/utaformatix3) wrapper for
TypeScript. This library can parse, generate, and convert project files among
singing voice synthesizer softwares.

## Requirements

This library requires one of the following environments:

- Deno
- Node.js 20.0.0 or later
- Bun
- Browser environment

## Installation

Please follow [jsr documentation](https://jsr.io/docs/using-packages) for
installation instructions.

```bash
# Deno
deno add @sevenc-nanashi/utaformatix-ts

# Node.js (one of the below, depending on your package manager)
npx jsr add @sevenc-nanashi/utaformatix-ts
yarn dlx jsr add @sevenc-nanashi/utaformatix-ts
pnpm dlx jsr add @sevenc-nanashi/utaformatix-ts

# Bun
bunx jsr add @sevenc-nanashi/utaformatix-ts
```

## Usage

`Project.fromFormat` converts a binary file to
[UtaFormatix Data](https://github.com/sdercolin/utaformatix-data).

```typescript
import { Project } from "jsr:@sevenc-nanashi/utaformatix-ts";

const stdMidiData = await Deno.readFile("./standard.mid");
const result = await Project.fromStandardMid(stdMidiData);

// You can skip parsing pitch if you want faster parsing.
const svpData = await Deno.readFile("./synthv.svp");
const result2 = await Project.fromSvp(svpData, { pitch: false });

// Exceptionally, fromUst allows array of File or Uint8Array. Each file represents a track.
const firstTrack = await Deno.readFile("./first_track.ust");
const secondTrack = await Deno.readFile("./second_track.ust");

const result3 = await Project.fromUst([firstTrack, secondTrack]);
```

`Project#toFormat` converts UtaFormatix Data to a binary file.

```typescript
import { Project } from "jsr:@sevenc-nanashi/utaformatix-ts";

const project = new Project(
  JSON.parse(await Deno.readTextFile("./standard.ufdata.json")),
);

const midResult: Uint8Array = await project.toStandardMid();
await Deno.writeFile("./standard.mid", midResult);

// You can use `{ pitch: true }` to include pitch data.
const ustxResult: Uint8Array = await project.toUstx({ pitch: true });
await Deno.writeFile("./openutau.ustx", ustxResult);

// generateUst and generateMusicXml returns multiple files. Each file represents a track.
const musicXmlResult: Uint8Array[] = await project.toMusicXml();
await Deno.writeFile("./first_track.musicxml", musicXmlResult[0]);
await Deno.writeFile("./second_track.musicxml", musicXmlResult[1]);
```

Lower level APIs are also available in `/base`.

```typescript
import {
  generateMusicXml,
  parseStandardMid,
} from "jsr:@sevenc-nanashi/utaformatix-ts/base";

const stdMidiData = await Deno.readFile("./standard.mid");
const result = await parseStandardMid(stdMidiData);

const binary = await generateMusicXml(result);
```

## License

This project is licensed under MIT License. See
[LICENSE](https://github.com/sevenc-nanashi/utaformatix-ts/blob/main/LICENSE)
for more information.
