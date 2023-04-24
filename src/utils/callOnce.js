const emptyFunction = () => {};

/**
 * @param {() => void} fn
 * @return {() => void}
 */
export function callOnce(fn) {
  let done = false;
  return function() {
    if (done) {
      return;
    }
    done = true;
    fn.call(this);
  }
}

/**
 * @param {string} fieldName
 * @param {() => void} fn
 * @return {() => void}
 */
export function callOnceInObject(fieldName, fn) {
  return function() {
    this[fieldName] = emptyFunction;
    fn.call(this);
  }
}
