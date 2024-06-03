# Contributing

Thank you for considering contributing to the project! This is a guide to help
you get started.

## Development

### How do I build? How do I run tests?

- Run `deno task test` to run tests. (Not `deno test`, because `deno task test`
  runs tests on both Deno and Node.js.)
- Run `deno task build` to build the project. Don't forget to clone submodules
  before building.

### What does these files do?

- `deps.ts`, `devDeps.ts`: Dependencies.

- `mod.ts`: Package root.
  - This file re-exports `UfData`, `Project` and `base.ts` functions which
    cannot called from `Project` directly.
- `base.ts`: Contains lower-level functions.
- `project.ts`: Contains `Project` class which is a wrapper for `base.ts`
  functions.

- `*.test.ts`: Unit tests.

- `tasks/`: Contains tasks for development.
  - `build.ts`: Build task. You can run `deno task build --force-copy` to force
    copy files.
  - `test.ts`: Test task. This runs tests on both Deno and Node.js.
    - This task creates npm package in `tasks/temporary_test_package`. Use this
      if needed.
  - `generateNotice.ts`: Generate NOTICE.md file. `deno task test` is required
    to run before this task.

### How to keep the project up to date with UtaFormatix

- Do `git pull` in `./utaformatix3`.

#### If there are changes for new format:

- Update `./base.ts` and `./project.ts` for new format.

```ts
// base.ts

/** Parse {extension} ({description}) file */
export const parseExt: SingleParseFunction = createSingleParse(
  core.parseExt,
  "extension",
);

// ...

/** Generate {extension} ({description}) file */
export const generateExt: SingleGenerateFunction = createSingleGenerate(
  core.generateExt,
);

// ...

export const parseFunctions = {
  // ...
  ext: parseExtension,
} as const satisfies Record<string, SingleParseFunction>;
```

```ts
// project.ts

export class Project implements BaseProject {
  // ...

  /** Creates a Project instance from {extension} ({description}) file. */
  static async fromExt(data: Uint8Array | File): Promise<Project> {
    return new Project(await base.parseExt(data));
  }

  /** Generates {extension} ({description}) file from the project. */
  static toExt(project: Project): Promise<Uint8Array> {
    return base.generateExt(project.data);
  }
}
```

#### If there are changes for new functions like `analyzeJapaneseLyricsType`:

- If the function requires project, add it to `base.ts` and `project.ts`.
  - One in `base.ts` should receive `UfData` and return the result.
  - One in `project.ts` should use the instance data and call the function in
    `base.ts`.

- If the function does not require project, add it to `base.ts` and re-export it
  in `mod.ts`

> [!IMPORTANT] Every function should be accessible (Whether it is directly or
> indirectly, like via `Project` class) from `mod.ts`.

<!--

# Personal Notes

## Update

- Update `version` in `deno.jsonc`
- Update `CHANGELOG.md`
- `git commit -am "Update: v0.3.0"`
- `git tag v0.3.0`
- `git push --tags origin main`

-->
