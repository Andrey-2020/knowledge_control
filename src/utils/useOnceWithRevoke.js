import {
  useState,
  useEffect,
} from 'react';

/**
 * Хук для использования функции только один раз,
 * при этом функция обязана возвращаться функцию "очистки после себя".
 * 
 * @param {() => (() => void)} action
 */
export default function useOnceWithRevoke(action) {
  const [revoke] = useState(action);
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => revoke, []);
}
