import { SchedulePair } from 'DBModels';


export interface Props {
  pair: SchedulePair,
}

/**
 * Типы предметов в расписании
 */
export declare const subjectTypes = {
  1: 'Практика',
  2: 'Лекция',
  3: 'Лабораторная',
};

/**
 * Отображение одной пары в расписании
 */
export default function SchedulePair(props: Props): JSX.Element;
