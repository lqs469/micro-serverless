import { Context, controller, post, inject, provide } from "midway";
const fs = require("fs");
const path = require("path");

@provide()
@controller("/api/uploadCode")
export class UploadController {
  @inject()
  ctx: Context;

  @post("/")
  async uploadCode(): Promise<void> {
    const { code = "", name = "" } = this.ctx.request.body;

    await new Promise(next => {
      fs.writeFile(
        path.resolve(`src/fns/${name}`),
        code,
        (err: string | Error) => {
          if (err) {
            return console.log(err);
          }

          next();
        }
      );
    });

    this.ctx.body = { code };
  }
}
