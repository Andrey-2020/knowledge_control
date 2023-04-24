import { CONTROL_TYPES } from 'globalStore/constants';

/**
 * Цвета тега, который отвечает за тип контроля
 */
export declare const CONTROL_TYPES_TAG_COLORS = {
  [CONTROL_TYPES.EXAM]: 'error',
  [CONTROL_TYPES.CREDIT]: 'processing',
  [CONTROL_TYPES.DIFFERENTIAL_CREDIT]: 'warning',
};

/**
 * Страница информации о предмете
 */
export default function Index(): JSX.Element;
