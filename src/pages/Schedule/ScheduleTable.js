import React, { useMemo } from 'react';
import classnames from 'classnames';
import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';

import classes from 'pages/Schedule/classes.module.scss';
import ScheduleDay from 'pages/Schedule/ScheduleDay';

/**
 * Создаёт пустую таблицу 14 дней (две недели) на 8 пар
 * 
 * @returns {null[][]}
 */
export function createEmptyScheduleTable() {
  const emptyScheduleTable = [];
  for (let dayNumber = 0; dayNumber < 14; dayNumber++) {
    const day = [];
    for (let pairNumber = 0; pairNumber < 8; pairNumber++) {
      day.push(null);
    }
    emptyScheduleTable.push(day);
  }
  return emptyScheduleTable;
}

/**
 * Время пар
 */
const pairTimes = [
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
 * Строчка со временем пар
 */
const pairTimesTds = pairTimes.map((time, index) => (
  <td key={time}>
    <b>{index + 1} пара</b>:<br/>
    <small>{time}</small>
  </td>
));

/**
 * Таблица с расписанием
 * 
 * @param {{
 *   table: import('DBModels').Schedule,
 *   week: number,
 * }}
 */
export default function ScheduleTable({ table, week }) {
  const { t } = useTranslation('pages.Schedule.ScheduleTable', { useSuspense: false });

  /** Сокращённое название дней недели */
  const dayNames = useMemo(() => [
    t('dayNames-monday'),
    t('dayNames-tuesday'),
    t('dayNames-wednesday'),
    t('dayNames-thursday'),
    t('dayNames-friday'),
    t('dayNames-saturday'),
    t('dayNames-sunday'),
  ], [t]);

  const scheduleCells = useMemo(() => {
    if (!table) {
      return [];
    }
    return table.slice(week * 7, week * 7 + 7).map((day, index) => (
      <tr key={index}>
        <td>{dayNames[index]}</td>
        <ScheduleDay day={day}/>
      </tr>
    ))
  }, [table, week, dayNames]);

  if (!table) {
    return <Empty/>;
  }
  return (
    <div className={classnames('mx-n4', classes.ScheduleTable)}>
      <table>
        <thead>
          <tr>
            <td>
            </td>
            {pairTimesTds}
          </tr>
        </thead>
        <tbody>
          {scheduleCells}
        </tbody>
      </table>
    </div>
  );
}
