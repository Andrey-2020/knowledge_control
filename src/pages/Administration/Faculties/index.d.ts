import { TableColumnType } from 'antd';

import {
  Department,
  Faculty,
} from 'DBModels';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import { Selector } from 'utils/createSelector';


export class State {
  departments: Department[];
  faculties: Faculty[];
  loading: BooleanState;
  selected: SettedState<number[]>;

  static create(): State;

  get departmentsSelector(): Selector<Department>;

  get columns(): TableColumnType[];

  get rowSelection(): {
    selectedRowKeys: number[],
    onChange: () => void,
  };

  setDataSource(data: [
    Department[],
    Faculty[],
  ]): void;

  getDataSource(): void;

  updateTable(): void;

  delete(ids: number[]): void;

  deleteSelected(): void;
}

/**
 * Страница CRUD факультета
 */
export default function Faculties(): JSX.Element;
