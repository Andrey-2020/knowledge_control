import { TableColumnType } from 'antd';

import { User } from 'DBModels';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  studentIds: number[],
}

export class State extends BaseState<Props> {
  students: User[];
  loading: BooleanState;

  static create(): State;

  get columns(): TableColumnType;

  getStudents(): void;
}

/**
 * Отображения списка студентов одной группы
 */
export function GroupTable(props: Props): JSX.Element;
