/**
 * @param {string?} firstName
 * @param {string?} lastName
 * @param {string?} patronymic
 * @param {string} incognita
 * @returns {string}
 */
export default function getFullName(firstName, lastName, patronymic, incognita) {
  const result = [];
  if (firstName) {
    result.push(firstName);
  }
  if (lastName) {
    result.push(lastName);
  }
  if (patronymic) {
    result.push(patronymic);
  }
  return result.join(' ') || incognita;
}

/**
 * @param {{
 *   firstName?: string,
 *   lastName?: string,
 *   patronymic?: string,
 * }} object
 * @param {string} incognita
 * @returns {string}
 */
export function getFullNameFromObject(object, incognita) {
  const result = [];
  if (object.firstName) {
    result.push(object.firstName);
  }
  if (object.lastName) {
    result.push(object.lastName);
  }
  if (object.patronymic) {
    result.push(object.patronymic);
  }
  return result.join(' ') || incognita;
}
