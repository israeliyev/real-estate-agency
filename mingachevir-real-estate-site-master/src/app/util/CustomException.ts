export class CustomException {

  readonly code: string;
  readonly warn: boolean;
  readonly interpolateParams?: object;

  constructor(messageCode: string,
              warn: boolean = false,
              interpolateParams?: object) {
    this.code = messageCode;
    this.warn = warn;
    this.interpolateParams = interpolateParams;
  }

  static warnInstance(messageCode: string, interpolateParams?: object): CustomException {
    return new CustomException(messageCode, true, interpolateParams);
  }
}
