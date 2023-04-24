import { onAnswerCallback } from 'pages/Tests/Test';

/**
 * Вопрос из теста
 */
export default function Question(args: {
  questionType: string,
  question: string,
  answers: string[],
  onAnswer: onAnswerCallback,
}): JSX.Element;
