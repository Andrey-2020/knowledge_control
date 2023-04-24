/**
 * Проверяет, совпадает ли у пути корень
 * 
 * equalPathRoot('/one', '/two') => false \
 * equalPathRoot('/one', '/one') => true \
 * equalPathRoot('/one', '/one?query=kek') => true
 * 
 * @param {string} pathRoot
 * @param {string} path
 * @returns {boolean}
 */
export default function equalPathRoot(pathRoot, path) {
  try {
    return new RegExp(`${pathRoot}(\\?|/|$)`).test(path);
  } catch (error) {
    return false;
  }
}
