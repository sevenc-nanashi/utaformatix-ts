/** @module Lower level translation functions */

import type { UfData } from "./deps.ts";

type Track = UfData["project"]["tracks"][0];

/*
* Removes notes with trailing `R` in track.
*
* This is useful when you're importing UST files (UTAU uses `R` for breaths).
*/
export const removeBreaths = (track: Track): Track => {
  return {
    ...track,
    notes: track.notes.filter((note) => !note.lyric.endsWith("R")),
  };
}


/*
* Replaces all vowel connections in track.
*
* @see https://github.com/sdercolin/utaformatix3/blob/master/core/src/main/kotlin/core/process/lyrics/LyricsReplacement.kt#L97-L129
*/
export const replaceVowelConnections = (track: Track, replaceTo: string = "ー"): Track => {
  return {
    ...track,
    notes: track.notes.map((note) => ({
      ...note,
      lyric: note.lyric.replace(/[+-ー]/g, replaceTo),
    })),
  };
}

