import { NewQuestion } from 'pages/Tests/Test';
import { Question } from 'DBModels';


export interface Props {
  questions: Question[];
  onChange(questions: Question[]): void;
}

/**
 * Отображение вопросов теста
 */
export default function QuestionsInTest(props: Props): JSX.Element;
