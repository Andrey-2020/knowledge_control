import React from 'react';
import { Checkbox } from 'antd';

/**
 * Выбор нескольких ответов
 * 
 * @param {{
 *   answers: string[],
 *   onAnswer: import('../Test').onAnswerCallback,
 * }}
 */
export default function Select({ answers, onAnswer }) {
  console.log()
  return (
    <Checkbox.Group onChange={onAnswer}>
      {answers.map((answer) => (
        <Checkbox
          key={answer.id}
          className="d-flex ml-0"
          value={answer.id}
        >
          {answer.answer}
        </Checkbox>
      ))}
    </Checkbox.Group>
  );
}
