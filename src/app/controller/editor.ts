import { Context, inject, controller, get, provide } from "midway";
const path = require("path");
const fs = require("fs");

@provide()
@controller("/edit")
export class EditController {
  @inject()
  ctx: Context;

  @get("/:name")
  async index() {
    const filename = this.ctx.params.name;

    const dirname = path.resolve("./src/fns");
    const fileContent: string = await new Promise(next => {
      fs.readFile(
        `${dirname}/${filename}`,
        "utf-8",
        (err: string, content: string) => {
          if (err) {
            console.error(err);
            next("");
          }

          next(encodeURIComponent(content));
        }
      );
    });

    await this.ctx.render("edit", { filename, fileContent });
  }
}
