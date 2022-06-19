import { Image } from "imagescript";
import { Command } from "cliffy/command";
import { ensureDir } from "std/fs";
import * as path from "std/path";
import { green } from "std/fmt/color";

const draw = new Command()
  .name("draw")
  .description("Draw a colored box")
  .option("-o, --output <path:string>", "Path of the output image", {
    default: "./",
  })
  .option("-n, --name <string>", "Name of the output image")
  .option("-c, --color <string>", "Color of the box", {
    default: "red",
  })
  .option(
    "-a, --alpha <alpha:number>",
    "Opacity of the box between 0 and 1, this can also be set with the color"
  )
  .option("-s, --size <width:number> <height:number>", "Size of the box", {
    required: true,
  })
  .option("-v, --verbose [verbose:boolean]", "Verbose output", { default: false })
  .action(
    async ({ size: [width, height], color, name, output, verbose, alpha }) => {
      await ensureDir(output);

      const imageColor = colorNameToHex(color);
      const colorNumber = colorHexToNumber(imageColor);
      const image = new Image(width, height).fill(colorNumber);

      const fileName = name || `box-${width}x${height}-${color}.png`;
      const filePath = path.join(output, fileName);

      if (alpha) {
        image.opacity(alpha);
      }

      await Deno.writeFile(filePath, await image.encode());

      if (verbose) {
        console.log(green(`Saved ${width}x${height} image to ${filePath}`));
      }
    }
  );

function colorHexToNumber(hex: string): number {
  const hasAlpha = hex.length === 9; // #RRGGBBAA
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (hasAlpha) {
    const a = parseInt(hex.slice(7, 9), 16);
    return Image.rgbaToColor(r, g, b, a);
  }

  return Image.rgbToColor(r, g, b);
}

function colorNameToHex(color: string) {
  switch (color) {
    case "red":
      return "#ff0000";
    case "green":
      return "#00ff00";
    case "blue":
      return "#0000ff";
    case "yellow":
      return "#ffff00";
    case "cyan":
      return "#00ffff";
    case "magenta":
      return "#ff00ff";
    case "brown":
      return "#8b4513";
    case "purple":
      return "#800080";
    case "lime":
      return "#00ff00";
    case "black":
      return "#000000";
    case "white":
      return "#ffffff";
    case "gray":
      return "#808080";
    default:
      return color;
  }
}

export default draw;
