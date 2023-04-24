import { message as antdMessage } from 'antd';
import { MessageType } from 'antd/lib/message';

/**
 * Фразы по ключевому слову
 *
 * @constant
 * @readonly
 */
export declare const PHRASES = {
  chocolate: 'Произошли небольшие технические шоколадки',
  inadequate: 'Произошли технические неадекватки',
  monkeys: 'Бригада специально обученных обезьян уже занимается решением проблемы',
  sorry: 'Приносим временные извинения за искренние неудобства',
};

/**
 * Добавляет ПЕРЕД сообщением выбранную фразу
 */
export function addToBeginning(
  message: string,
  phraseType: string,
): string;

/**
 * Добавляет ПОСЛЕ сообщения выбранную фразу
 */
export function addToEnd(
  message: string,
  phraseType: string,
): string;

/**
 * Пример
 * console.log(decorateMessage({
 *   message: 'Ошибка интернет-соединения.',
 *   before: ['chocolate', 'inadequate'],
 *   after: ['monkeys', 'sorry']
 * }));
 * >>> "Произошли небольшие технические шоколадки.
 * Произошли технические неадекватки: Ошибка интернет-соединения.
 * Бригада специально обученных обезьян уже занимается решением проблемы.
 * Приносим временные извинения за искренние неудобства."
 */
export default function decorateMessage(args: {
  message,
  before?: boolean,
  after?: boolean,
}): string;

/**
 * Вывод стандартного сообщения об ошибке
 */
export function createDecoratedErrorMessage(
  message: string,
  ...args: any[],
): MessageType;
