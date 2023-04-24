import React from 'react';
import { Divider } from 'antd';

import SELECT from 'pages/Tests/Question/Select';
import WRITE from 'pages/Tests/Question/Write';
import MATCH from 'pages/Tests/Question/Match.js';
import SEQUENCE from 'pages/Tests/Question/Sequense.js';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


const questionsTypes = {
  SELECT,
  WRITE,
  SEQUENCE,
  MATCH,
};

/**
 * Вопрос из теста
 * 
 * @param {{
 *   questionType: string,
 *   question: string,
 *   answers: string[],
 *   onAnswer: import('../Test').onAnswerCallback,
 * }}
 */
export default function Question({
  questionType,
  question,
  answers,
  onAnswer,
}) {
  const AnswerComponent = questionsTypes[questionType];
  return (
    <>
      <h6 className={question}>{question}</h6>
      <Divider />
      {AnswerComponent ?
				<DndProvider backend={HTML5Backend}>
                <AnswerComponent
          onAnswer={onAnswer}
          answers={answers}
        />
      </DndProvider>
        :
        'Пока не готово'
      }
    </>
  );
}
