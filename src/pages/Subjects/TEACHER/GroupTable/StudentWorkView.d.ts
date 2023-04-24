import { Work } from 'DBModels';
import { MARK_TYPES } from 'globalStore/constants';
import { Mark } from 'pages/Subjects/TEACHER/GroupTable/index';
import BaseState from 'plugins/mobx/BaseState';
import { BooleanState } from 'plugins/mobx/fields';


/**
 * Цвета тегов оценок
 */
export declare const MARK_COLORS = {
  [MARK_TYPES.FIVE]: 'success',
  [MARK_TYPES.FOUR]: 'processing',
  [MARK_TYPES.THREE]: 'warning',
  [MARK_TYPES.UNSATISFACTORILY]: 'error',
};

export interface Props {
  work: Work;
  taskTitle: string;
  onChangeMark: (mark: Mark) => void;
}

export class State extends BaseState<Props> {

}

/**
 * Представление сданного студентом задания
 */
export function StudentWorkView(props: Props): JSX.Element;
