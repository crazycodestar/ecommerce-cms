export function isUndefined(value: any): value is undefined {
  return value === undefined;
}

export function isDefined(value: any) {
  return !isUndefined(value);
}
