const fs = require("fs");
const path = require("path");

import { provide } from "midway";
import {
  IVmService,
  IVmOptions,
  IFnObject,
  // IVmResult
  IReadFilesParams,
  IFnsResult
} from "../interface";

@provide("vmService")
export class VmService implements IVmService {
  fnPool: IFnObject = {
    // a: () => 1,
    // b: () => 2,
  };

  onFileContent(filename: string, content: string): void {
    this.fnPool[filename.replace(/\.ts|\.js/g, "")] = content;
  }

  async getFn(options: IVmOptions): Promise<string> {
    await this.readFiles({
      dirname: path.resolve("./src/fns"),
      onError: err => console.error(err)
    });

    const fnString = this.fnPool[options.id];

    return fnString;
  }

  async readFiles({ dirname, onError }: IReadFilesParams): Promise<IFnsResult> {
    return new Promise(next => {
      fs.readdir(dirname, (err: string, filenames: string[]) => {
        if (err) {
          onError(err);
          return;
        }

        let sum = 0;

        filenames.forEach(filename => {
          fs.readFile(
            `${dirname}/${filename}`,
            "utf-8",
            (err: string, content: string) => {
              if (err) {
                onError(err);
                return;
              }
              this.onFileContent(filename, content);
              sum++;

              if (sum === filenames.length) {
                next();
              }
            }
          );
        });
      });
    });
  }
}
