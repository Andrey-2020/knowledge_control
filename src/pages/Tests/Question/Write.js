import React, { useCallback, useEffect } from 'react';
import { Input } from 'antd';

/**
 * Ввод правильного ответа символами
 * 
 * @param {{
 *   onAnswer: import('../Test').onAnswerCallback,
 * }}
 */
export default function Write({ onAnswer }) {
  useEffect(() => {
    onAnswer([""]);
    // console.log(questions)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
  return (
    <Input
      onChange={useCallback((event) => {
        onAnswer([event.target.value]);
      }, [onAnswer])}
    />
  );
}
