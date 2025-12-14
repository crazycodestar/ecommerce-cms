function formatReturnedValue<T extends string | number>(
  value: string | number,
  type: T
): T {
  if (type === "number") return Number(value) as T;
  return value as T;
}

export type ThreeBlueOneBrown<T extends string | number> = [T, T, T, T];
export function threeBlueOneBrown<T extends string | number>(
  values: ThreeBlueOneBrown<T>
) {
  const dict: Record<T, number> = {} as Record<T, number>;

  for (let i = 0; i < values.length; i++) {
    const value = dict[values[i]];
    if (value) dict[values[i]] = value + 1;
    else dict[values[i]] = 1;
  }

  let threeBlue: T | null = null;
  let oneBrown: T | null = null;

  Object.entries(dict).forEach(([value, count]) => {
    if (count === 3)
      threeBlue = formatReturnedValue(value as T, typeof values[0]) as T;
    else if (count === 1)
      oneBrown = formatReturnedValue(value as T, typeof values[0]) as T;
  });

  return threeBlue && oneBrown ? [threeBlue, oneBrown] : null;
}
