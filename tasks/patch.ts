import { bundle } from "https://deno.land/x/emit@0.40.0/mod.ts";

export const patch = async () => {
  const base = await Deno.readTextFile(
    `${import.meta.dirname}/../patched/build/distributions/utaformatix.js`,
  );
  const builtBase = await Deno.readTextFile(
    `${import.meta.dirname}/builtBase.js`,
  );
  // Replacing `// -- replace --` doesn't work for some reason
  // TODO: Investigate why
  const patched = `${builtBase};${base};\nexport default exports.utaformatix;`;
  await Deno.writeTextFile(
    `${import.meta.dirname}/../typescript/built.tmp.js`,
    patched,
  );

  console.log("Patched utaformatix.js, bundling...");

  const bundled = await bundle(
    `${import.meta.dirname}/../typescript/built.tmp.js`,
    {
      minify: true,
    },
  );
  await Deno.writeTextFile(
    `${import.meta.dirname}/../typescript/built.mjs`,
    bundled.code,
  );
  await Deno.remove(`${import.meta.dirname}/../typescript/built.tmp.js`);
};
