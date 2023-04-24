import { ScheduleDay } from 'DBModels';

/**
 * Рендер массива пар или выходного дня
 */
export default function ScheduleDay(args: {
  day: ScheduleDay,
}): JSX.Element|JSX.Element[];