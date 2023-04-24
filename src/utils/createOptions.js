/**
 * @template T
 * @param {T[]} array
 * @param {string} valueKey
 * @param {string} labelKey
 * 
 * @return {import("CommonTypes").Options<T[number][valueKey]>}
 */
export default function createOptions(array, valueKey, labelKey) {
  return array.map((element) => ({
    value: element[valueKey],
    label: element[labelKey],
  }));
}
