import { Image } from "imagescript";
import { Command } from "cliffy/command";
import { ensureDir, expandGlob } from "std/fs";
import * as path from "std/path";

const crop = new Command()
  .name("crop")
  .description("Crop an image")
  .option(
    "-i, --input <path...:string>",
    "Path or glob to the images to crop",
    {
      required: true,
    }
  )
  .option("-o, --output <path:string>", "Path to the output directory", {
    required: true,
  })
  .option("-s, --size <width:number> <height:number>", "Size of the crop", {
    required: true,
  })
  .option("-n, --name [name:string]", "Name of the output images", {
    default: "img",
  })
  .option("-o, --offset <x:number> <y:number>", "Offset of the crop")
  .option("-v, --verbose", "Verbose output", { default: false })
  .action(async ({ input, output, size, offset = [0, 0], verbose }) => {
    // Ensure the output directory exists
    await ensureDir(output);

    let count = 0;

    for (const p in input) {
      const walkEntries = expandGlob(p);

      for await (const e of walkEntries) {
        if (e.isFile && e.name.endsWith(".png")) {
          const file = await Deno.readFile(e.path);
          const image = await Image.decode(file);
          const [width, height] = size;
          const [x, y] = offset;
          const cropped = image.crop(x, y, width, height);
          const outPath = path.join(output, `${e.name}${++count}.png`);
          await Deno.writeFile(outPath, await cropped.encode());

          if (verbose) {
            console.log(`Saved ${width}x${height} cropped image to ${outPath}`);
          }
        }
      }
    }
  });

export default crop;
