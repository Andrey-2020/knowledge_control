import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Извлекает search-параметры из текущего адреса
 * 
 * @returns {URLSearchParams}
 */
export default function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location]);
}
