/**
 * @description User-Service parameters
 */
export interface IVmOptions {
  id: string;
}

export interface IFnObject {
  [key: string]: string;
}

/**
 * @description Vm-Service response
 */
// export interface IVmResult {
//   fn: () => void;
// }

/**
 * @description Vm-Service abstractions
 */
export interface IVmService {
  getFn(options: IVmOptions): Promise<any>;
}

export interface IReadFilesParams {
  dirname: string;
  onError: (options: string) => void;
}

export interface IFnsResult {
  [key: string]: () => any;
}

export interface ISandbox {
  [key: string]: any;
}
