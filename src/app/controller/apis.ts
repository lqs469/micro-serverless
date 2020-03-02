import { Context, controller, post, inject, provide } from 'midway';
const fs = require('fs');
const path = require('path');

@provide()
@controller('/api')
export class UploadController {
  @inject()
  ctx: Context;

  @post('/update')
  async update(): Promise<void> {
    const { code = '', name = '' } = this.ctx.request.body;

    await new Promise(next => {
      fs.writeFile(
        path.resolve(`src/fns/${name}`),
        code,
        (err: string | Error) => {
          if (err) {
            return console.log(err);
          }

          next();
        },
      );
    });

    this.ctx.body = { code };
  }

  @post('/remove')
  async remove(): Promise<void> {
    const { name = '' } = this.ctx.request.body;

    const filepath = path.resolve(`src/fns/${name}`);
    await new Promise(next => {
      fs.stat(filepath, err => {
        if (err) {
          return console.error(err);
        }

        fs.unlink(filepath, (err: Error) => {
          if (err) {
            console.log(err);
          }

          console.log('deleted successfully!');
          next();
        });
      });
    });

    this.ctx.body = {};
  }
}
