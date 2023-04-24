import { QUESTIONS_TYPES } from 'globalStore/constants';
import { NewQuestion } from 'pages/Tests/Test';


export interface Props {
  onAdd: NewQuestion;
}

export interface Answer {
  key: string;
  text: string;
  right: boolean;
  strict: boolean;
}

export interface AnswerForServer {
  key: { answer: string; };
  answer: string | { answer: string; };
  isRight: boolean;
  isStrict: boolean;
}

export interface FormData {
  question: string;
  questionType: QUESTIONS_TYPES;
  fileIds: number[];
  complexity: 3 | 4 | 5;
}

/**
 * Модальное окно добавления вопроса теста
 */
export default function AddQuestionModal(props: Props): JSX.Element;
