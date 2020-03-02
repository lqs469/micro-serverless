import { Context, inject, controller, get, provide } from 'midway';
import { IVmService } from '../../interface';

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
    await this.ctx.render('index', { files });
  }
}
