/**
 * Хук преобразования массива объектов в массив { value, label }
 */
export default function useOptions<
  Type extends object,
  Value extends keyof Type,
  Label extends keyof Type,
>(
  array: Type[],
  _value: Value,
  _label: Label,
): {
  value: Type[Value],
  label: Type[Label],
}[];
