import { AnswerForServer } from 'pages/Tests/TEACHER/AddQuestionModal';


export interface onAnswerCallback {
  (answer: Answer): void;
}

/** Новые вопросы, которые только создаются */
export declare type NewQuestion = {
  question: string,
  questionType: QUESTIONS_TYPES,
  fileIds: number[],
  answers: AnswerForServer[],
  complexity: number,
};

/** Так хранятся ответы на тест */
export interface TestAnswers {
  [questionId: string]: Answer,
};

/** Формат ответов для сервера */
export declare type TestAnswersForServer = {
  questionId: number,
  answers: Answer[],
}[];

/**
 * Тест для пользователя
 */
export default function Test(): JSX.Element;
