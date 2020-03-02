import { Context, inject, controller, get, provide } from 'midway';
import { IVmService } from '../../interface';

@provide()
@controller('/edit')
export class EditController {
  @inject()
  ctx: Context;

  @inject('vmService')
  service: IVmService;

  @get('/:name')
  async index() {
    const filename = this.ctx.params.name;

    const fileContent = encodeURIComponent(
      await this.service.getFn({ id: filename }),
    );

    const files = await this.service.getList();

    await this.ctx.render('edit', { files, filename, fileContent });
  }
}
