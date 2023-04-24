import { useMemo } from 'react';

/**
 * Хук для создание объекта,
 * где ключами является выбранное поле объектов из массива,
 * а значениеми сами объекты массива.
 * Чаще всего использутся с id.
 * 
 * @template Type
 * 
 * @param {Type[]} array
 * @param {keyof Type} selector - id-like
 * 
 * @returns {{ [Type[selector]]: Type }}
 */
export default function useSelector(array, selector) {
  return useMemo(() => {
    const result = {};
    for (const element of array) {
      result[element[selector]] = element;
    }
    return result;
  }, [array, selector]);
}
