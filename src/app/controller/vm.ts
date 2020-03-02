const vm = require("vm");

import { Context, controller, get, inject, provide } from "midway";
import {
  IVmService,
  ISandbox
  // IVmResult
} from "../../interface";

const TIMEOUT = 1000 * 1.5;

@provide()
@controller("/vm")
export class VmController {
  @inject()
  ctx: Context;

  @inject("vmService")
  service: IVmService;

  @get("/:id")
  async getVm(): Promise<void> {
    let timr = null;
    const id: string = this.ctx.params.id;

    let fnString = await this.service.getFn({ id });
    fnString = `${fnString};
      main(ctx);
    `;

    const result = await new Promise(
      (next: (data: any) => void, reject: (err: Error) => void) => {
        const sandbox: ISandbox = {
          setInterval,
          setTimeout,
          ctx: this.ctx
        };

        try {
          timr = setTimeout(() => {
            reject(new Error("Script execution timed out."));
          }, TIMEOUT);

          vm.createContext(sandbox);
          const data = vm.runInContext(fnString, sandbox, {
            filename: id,
            timeout: TIMEOUT
          });

          next(data);
        } catch (error) {
          reject(error);
        }
      }
    ).catch(err => {
      return err instanceof Error ? err : new Error(err.stack);
    });

    if (timr) {
      clearTimeout(timr);
      timr = null;
    }

    let resBody = {};

    if (result instanceof Error) {
      console.log("[ERROR]", result);

      resBody = {
        error: result.toString
          ? result.toString().replace(/Error: Error: /g, "Error: ")
          : result
      };
    } else {
      console.log("[Response]", result);

      resBody = {
        data: result || ""
      };
    }

    this.ctx.body = resBody;
  }
}
