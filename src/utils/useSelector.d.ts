/**
 * Хук для создание объекта,
 * где ключами является выбранное поле объектов из массива,
 * а значениеми сами объекты массива.
 * Чаще всего использутся с id.
 */
export default function useSelector<
  Type extends object,
  Selector extends keyof Type,
>(
  array: Type[],
  selector: Selector,
): {
  [Selector]: Type,
};
