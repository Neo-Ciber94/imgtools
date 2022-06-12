import { Image } from "imagescript";
import { Command } from "cliffy/command";
import { ensureDir, expandGlob } from "std/fs";
import * as path from "std/path";

const RESIZE_MODE = {
  auto: "auto",
  nearest: "nearest",
} as const;

const resize = new Command()
  .name("resize")
  .description("Resize an image")
  .option(
    "-i, --input <path...:string>",
    "Path or glob to the images to resize",
    {
      required: true,
    }
  )
  .option("-o, --output <path:string>", "Path to the output directory", {
    required: true,
  })
  .option("-s, --size <width:number> <height:number>", "Size of the resize", {
    required: true,
  })
  .option("-n, --name [name:string]", "Name of the output images", {
    default: "img",
  })
  .option(
    "-m, --mode <resizeMode:string>",
    "Mode to use for resizing: auto or nearest",
    {
      default: RESIZE_MODE.auto,
    }
  )
  .option("-v, --verbose", "Verbose output", { default: false })
  .action(async ({ input, output, size, mode, verbose }) => {
    if (
      !Object.values(RESIZE_MODE).includes(mode as keyof typeof RESIZE_MODE)
    ) {
      throw new Error(`Invalid resize mode: ${mode}`);
    }

    // Ensure the output directory exists
    await ensureDir(output);

    let count = 0;

    for (const p in input) {
      const walkEntries = expandGlob(p);

      for await (const e of walkEntries) {
        if (e.isFile && e.name.endsWith(".png")) {
          const resizeMode: string | undefined =
            mode === RESIZE_MODE.auto
              ? undefined
              : Image.RESIZE_NEAREST_NEIGHBOR;

          const file = await Deno.readFile(e.path);
          const image = await Image.decode(file);
          const [width, height] = size;
          const resized = image.resize(width, height, resizeMode);
          const outPath = path.join(output, `${e.name}${++count}.png`);
          await Deno.writeFile(outPath, await resized.encode());

          if (verbose) {
            console.log(`Saved ${width}x${height} resized image to ${outPath}`);
          }
        }
      }
    }
  });

export default resize;
