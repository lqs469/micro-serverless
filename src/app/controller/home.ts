import { Context, inject, controller, get, provide } from "midway";
const path = require("path");
const fs = require("fs");

@provide()
@controller("/")
export class HomeController {
  @inject()
  ctx: Context;

  @get("/")
  async index() {
    const files: string[] = await new Promise(next => {
      fs.readdir(path.resolve("./src/fns"), (err: string, files: string[]) => {
        if (err) {
          console.error(err);
          next([]);
        }

        next(files.map(file => encodeURIComponent(file)));
      });
    });

    await this.ctx.render("index", { files });
  }
}
