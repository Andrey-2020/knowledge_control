import { useState } from 'react';

/**
 * Хук для использования функции только один раз, при первом создании компонента, до рендера
 * 
 * @param {() => void} action
 */
export default function useOnce(action) {
  useState(action);
}
