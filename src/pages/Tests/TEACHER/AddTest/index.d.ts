export interface UrlParams {
  subjectId: string;
}

export interface FormData {
  name: string;
  decryption: string;
  questionQuantityInTest: number;
  attemptNumberInTest: number;
}

/**
 * Страница добавления теста
 */
export default function AddTest(): JSX.Element;
