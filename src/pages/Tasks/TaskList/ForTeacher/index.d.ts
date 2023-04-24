import { Task } from 'DBModels';

export declare type TasksByStudyGroups = {
  [id: string]: Task[],
};

/**
 * Просмотр групп и заданий по ним,
 * а также переход на добавление, редактирование и удаление заданий
 */
export default function ForTeacher(): JSX.Element;
