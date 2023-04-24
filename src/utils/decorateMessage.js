import { message as antdMessage } from 'antd';

/**
 * Фразы по ключевому слову
 *
 * @constant
 * @readonly
 */
const PHRASES = {
  chocolate: 'Произошли небольшие технические шоколадки',
  inadequate: 'Произошли технические неадекватки',
  monkeys: 'Бригада специально обученных обезьян уже занимается решением проблемы',
  sorry: 'Приносим временные извинения за искренние неудобства',
};

/**
 * Добавляет ПЕРЕД сообщением выбранную фразу
 *
 * @param {string} message - сообщение
 * @param {string} phraseType - тип фразы из PHRASES
 * @returns {string}
 */
function addToBeginning(message, phraseType) {
  return `${PHRASES[phraseType]}. ${message}`;
}

/**
 * Добавляет ПОСЛЕ сообщения выбранную фразу
 *
 * @param {string} message - сообщение
 * @param {string} phraseType - тип фразы
 * @returns {string}
 */
function addToEnd(message, phraseType) {
  return `${message} ${PHRASES[phraseType]}.`;
}

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
 *
 * @param {{
 *   message: string,
 *   before?: boolean,
 *   after?: boolean,
 * }}
 * @returns {string}
 */
export default function decorateMessage({ message, before=false, after=false }) {
  /** @type {string} */
  let result = message;
  if (before) {
    result = addToBeginning(result, before[before.length - 1]);
    for (let i = before.length - 2; i >= 0; i--) {
      result = addToBeginning(result, before[i]);
    }
  }
  result += '.';
  if (after) {
    for (let phrase of after) {
      result = addToEnd(result, phrase);
    }
  }
  return result;
}

/**
 * Вывод стандартного сообщения об ошибке
 *
 * @param {string} message
 * @param {...any} args
 * @returns {import('antd/lib/message').MessageType}
 */
export function createDecoratedErrorMessage(message ,...args) {
  const decoratedMessage = decorateMessage({
    message,
    before: ['inadequate'],
    after: ['monkeys', 'sorry']
  });
  return antdMessage.error(decoratedMessage, ...args)
}
