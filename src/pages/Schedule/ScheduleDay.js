import React from 'react';

import SchedulePair from 'pages/Schedule/SchedulePair';

/**
 * Отображение массива пар или выходного дня
 * 
 * @param {{ day: import('DBModels').ScheduleDay }}
 * @returns {(JSX.Element[]|JSX.Element)}
 */
export default function ScheduleDay({ day }) {
  if (day.every((pair) => !pair)) {
    return (
      <td colSpan="8"/>
    );
  }
  return day.map((pair, index) => (
    <SchedulePair
      key={index}
      pair={pair}
    />
  ));
}