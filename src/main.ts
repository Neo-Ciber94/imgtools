import { Command } from "cliffy/command";
import check from "./check.ts";
import draw from "./draw.ts";
import crop from "./crop.ts";
import resize from "./resize.ts";
import spriteSheet from "./sprite-sheet.ts";

const command = new Command()
  .name("imgtools")
  .description("Utilities for image manipulation")
  .command("check", check)
  .command("sprite-sheet", spriteSheet)
  .command("crop", crop)
  .command("resize", resize)
  .command("draw", draw);

await command.parse(Deno.args);
