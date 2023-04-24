import { TableColumnType } from 'antd';

import {
  StudyGroup,
  Department,
  User,
} from 'DBModels';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export class State extends BaseState<undefined> {
  studyGroups: StudyGroup[];
  departments: Department[];
  users: User[];

  loading: BooleanState;
  selected: SettedState<number[]>;

  static create(): State;

  get columns(): TableColumnType[];

  get rowSelection(): {
    selectedRowKeys: number[],
    onChange: () => void,
  };

  setDataSource(data: [
    Department[],
    Faculty[],
  ]): void;

  getDataSourceOnce(): void;

  updateTable(): void;

  delete(ids: number[]): void;

  deleteSelected(): void;
}

/**
 * Страница CRUD пользователей
 */
export default function Users(): JSX.Element;
