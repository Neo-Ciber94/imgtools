import { Image } from "imagescript";
import { Command } from "cliffy/command";
import { ensureDir } from "std/fs";
import * as path from "std/path";

const spriteSheet = new Command()
  .name("sprite-sheet")
  .description("Split a sprite-sheet into multiple images")
  .option("-i, --input <path:string>", "Path to the image to split", {
    required: true,
  })
  .option("-o, --output <path:string>", "Path to the output directory", {
    required: true,
  })
  .option(
    "-p, --parts <x:number> <y:number>",
    "Number of parts to split the image into",
    {
      required: true,
    }
  )
  .option("-s, --size <width:number> <height:number>", "Size of each part", {
    required: true,
  })
  .option(
    "-c, --crop [width:number] [height:number]",
    "Crop the image to the size of the grid"
  )
  .option("--crop-offset <x:number> <y:number>", "Offset of the crop")
  .option(
    "-n, --name [name:string]",
    "Name of the output images, by default is img",
    {
      default: "img",
    }
  )
  .option("--skip-empty [skipEmpty:boolean]", "Skip empty images", {
    default: false,
  })
  .option("-v, --verbose [verbose:boolean]", "Verbose output", { default: false })
  .action(
    async ({
      input: imagePath,
      output: outputPath,
      name: outFileName,
      skipEmpty,
      crop,
      cropOffset,
      parts,
      size,
      verbose,
    }) => {
      const [x, y] = parts;
      const [width, height] = size;
      const image = await Image.decode(Deno.readFileSync(imagePath));
      let index = 0;

      if (verbose) {
        console.log(
          `Splitting ${imagePath} into ${x}x${y} parts of size ${width}x${height}`
        );
      }

      // Ensure the output directory exists
      await ensureDir(outputPath);

      for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
          const xOffset = width * j;
          const yOffset = height * i;
          let part = image.clone().crop(xOffset, yOffset, width, height);

          if (crop) {
            const [cropWidth, cropHeight] = crop as number[];
            const [cropOffsetX = 0, cropOffsetY = 0] = cropOffset
              ? (cropOffset as number[])
              : [0, 0];
            part = part.crop(cropOffsetX, cropOffsetY, cropWidth, cropHeight);
          }

          if (skipEmpty && isEmpty(part)) {
            continue;
          }

          await saveImage(part, ++index);
        }
      }

      async function saveImage(image: Image, index: number) {
        const fileName = `${outFileName}${index}.png`;
        const filePath = path.join(outputPath, fileName);

        if (verbose) {
          console.log(`Saved ${width}x${height} image to ${filePath}`);
        }

        await Deno.writeFile(filePath, await image.encode());
      }

      function isEmpty(image: Image): boolean {
        const { width, height } = image;

        for (let i = 0; i < width; i++) {
          for (let j = 0; j < height; j++) {
            const [_r, _g, _b, a] = image.getRGBAAt(i + 1, j + 1);

            if (a > 0) {
              return false;
            }
          }
        }

        return true;
      }
    }
  );

export default spriteSheet;
