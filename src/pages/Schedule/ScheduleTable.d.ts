import { ArrayFixedLength } from 'CommonTypes';
import { Schedule } from 'DBModels';

/**
 * Создаёт пустую таблицу 14 дней (две недели) на 8 пар
 */
export function createEmptyScheduleTable(): ArrayFixedLength<ArrayFixedLength<null, 8>, 14>;

/**
 * Сокращённое название дней недели
 */
export declare const dayName = [
  'Пн',
  'Вт',
  'Ср',
  'Чт',
  'Пт',
  'Сб',
  'Вс',
];

/**
 * Время пар
 */
export declare const pairTimes = [
  '8:00 - 9:30',
  '9:40 - 11:10',
  '11:30 - 13:00',
  '13:10 - 14:40',
  '14:50 - 16:20',
  '16:30 - 18:00',
  '18:10 - 19:40',
  '19:50 - 21:20',
];

/**
 * Таблица с расписанием
 */
export default function ScheduleTable(args: {
  table: Schedule,
  week: number,
}): JSX.Element;
