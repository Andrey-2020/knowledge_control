/**
 * Функция указывает, входит ли поисковое значение в строковую опцию
 */
export function noCaseFilter(
  inputValue: string,
  option: { value: string },
): boolean;

/**
 * Перевод доступных типов для поиска расписания - по учителю или по группе
 */
export declare const searchByTranslation = {
  'groups': 'Группа',
  'teachers': 'Учитель',
};

/**
 * Страницы расписания
 */
export default function Schedule(): JSX.Element;
