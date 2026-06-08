export function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function platesMatch(a: string, b: string) {
  const left = normalizePlate(a);
  const right = normalizePlate(b);
  return Boolean(left && right && left === right);
}
