import { Image } from "imagescript";
import { Command } from "cliffy/command";
import * as path from "std/path";
import { green } from "std/fmt/color";

const check = new Command()
  .name("stat")
  .description("Get information about an image")
  .option("-i, --input <path:string>", "Path of the image", {
    required: true,
  })
  .action(async ({ input }) => {
    const fileStat = await Deno.stat(input);
    const file = await Deno.readFile(input);
    const image = await Image.decode(file);

    const name = path.basename(input);
    console.log(`${green("Image size:")} ${image.width}x${image.height}`);
    console.log(`${green("File name:")} ${name}`);
    console.log(`${green("File size:")} ${fileStat.size} bytes`);
    console.log(
      `${green("File creation time:")} ${
        fileStat.birthtime?.toUTCString() || ""
      }`
    );
    console.log(
      `${green("File last access time:")} ${
        fileStat.atime?.toUTCString() || ""
      }`
    );
    console.log(
      `${green("File last modification time:")} ${
        fileStat.mtime?.toUTCString() || ""
      }`
    );
  });

export default check;
