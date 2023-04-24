import { useMemo } from 'react';

/**
 * Хук преобразования массива объектов в массив { value, label }
 *
 * @template Type
 * @param {Type[]} array
 * @param {keyof Type} _value
 * @param {keyof Type} _label
 *
 * @returns {{
 *   value: Type[_value],
 *   label: Type[_label],
 * }[]}
 */
export default function useOptions(array, _value, _label) {
  return useMemo(() => (
    array.map(({
      [_value]: value,
      [_label]: label,
    }) => ({ value, label }))
  ), [array, _value, _label]);
}
