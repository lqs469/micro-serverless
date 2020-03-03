import { Context, inject, controller, get, provide } from 'midway';
import { IVmService } from '../../interface';
const fs = require('fs');
const path = require('path');

@provide()
@controller('/')
export class HomeController {
  @inject()
  ctx: Context;

  @inject('vmService')
  service: IVmService;

  @get('/')
  async index() {
    let files = await this.service.getList();

    const readme = await new Promise(next => {
      fs.readFile(
        path.resolve('./README.md'),
        'utf-8',
        (err: string, content: string) => {
          if (err) {
            console.error(err);
            return;
          }

          next(encodeURIComponent(content));
        },
      );
    });

    await this.ctx.render('index', { files, readme });
  }
}
