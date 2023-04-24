/**
 * Реверсирует bool значение
 */
export function reverseBool(value: boolean): boolean;

/**
 * Hook для мемоизации повторящихся функций работы с boolean
 * (использовать их при передаче в дочерние компоненты).
 * Возвращает само значение и четыре функции:
 * - set false
 * - set true
 * - toggle
 * - set
 */
export default function useBool(init: boolean): [
  boolean,
  setFalse: () => void,
  setTrue: () => void,
  toggle: () => void,
  set: (value: boolean) => void,
];
