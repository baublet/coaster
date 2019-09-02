export default function decimalTypeRequiresScaleAndPrecision(
  columnName: string
): string {
  return `We declared ${columnName} as a decimal type, but we did not pass it a scale or a precision. A scale is how many numbers are to the left of the decimal, the precision is how many are to the right. Both are required for decimal type. The defaults are a scale of 5 and a precision of 2.`;
}
