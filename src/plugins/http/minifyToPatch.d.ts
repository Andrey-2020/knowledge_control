/**
 * Берёт из объекта только выбранные ключи,
 * также удаляет одинаковые данные с initialData
 */
export default function minifyToPatch(
  data: object,
  initialData: object,
  keys: keyof Partial<data>,
): { [...keys] };
