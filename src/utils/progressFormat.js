/**
 * Форматирование строки прогресса в прцоентах
 *
 * @param {number} progress
 * @returns {string}
 */
export default function progressFormat(progress) {
  return `${progress.toFixed(2)}%`;
}
