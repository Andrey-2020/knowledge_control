import {
  useState,
  useCallback,
} from 'react';

/**
 * Реверсирует bool значение
 * 
 * @param {boolean} value
 * 
 * @returns {boolean}
 */
export function reverseBool(value) {
  return !value;
}

/**
 * Hook для мемоизации повторящихся функций работы с boolean
 * (использовать их при передаче в дочерние компоненты).
 * Возвращает само значение и четыре функции:
 * - set false
 * - set true
 * - toggle
 * - set
 * 
 * @param {boolean} init
 * 
 * @returns {[
 *   boolean,
 *   setFalse: () => void,
 *   setTrue: () => void,
 *   toggle: () => void,
 *   set: (value: boolean) => void,
 * ]}
 */
export default function useBool(init) {
  const [bool, setBool] = useState(init);
  return [
    bool,
    useCallback(() => { setBool(false); }, []),
    useCallback(() => { setBool(true); }, []),
    useCallback(() => { setBool(reverseBool); }, []),
    setBool,
  ];
}
