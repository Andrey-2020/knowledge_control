import isEqual from 'lodash/isEqual';

/**
 * @param {{}} data
 * @param {{}} initialData
 * @param {string[]} keys
 * 
 * @return {{}}
 */
export default function minifyToPatch(data, initialData, keys) {
  const result = {};
  for (const key of keys) {
    if (!isEqual(data, initialData)) {
      result[key] = data[key];
    }
  }
  return result;
}
