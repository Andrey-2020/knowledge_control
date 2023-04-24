import { onAnswerCallback } from 'pages/Tests/Test';

/**
 * Выбор нескольких ответов
 */
export default function Select(args: {
  answers: string[],
  onAnswer: onAnswerCallback,
}): JSX.Element;
