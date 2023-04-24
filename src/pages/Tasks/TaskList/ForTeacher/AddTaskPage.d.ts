import { TASK_TYPES } from 'globalStore/constants';


export interface FormData {
  studyGroupIds: number[];
  title: string;
  type: TASK_TYPES;
  description: string;
}

/**
 * Форма добавления задания
 */
export default function AddTaskPage(): JSX.Element;
