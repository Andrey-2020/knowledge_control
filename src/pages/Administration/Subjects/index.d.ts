import { TableColumnType } from 'antd';

import {
  Department,
  Subject,
  SubjectSemester,
} from 'DBModels';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import createOptions from 'utils/createOptions';


export class State {
  subjectSemesters: SubjectSemester[];
  departments: Department[];
  subjects: Subject[];

  loading: BooleanState;
  selected: SettedState<number[]>;

  static create(): State;

  get departmentsOptions(): ReturnType<typeof createOptions>;

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
 * Страницы CRUD предметов
 */
export default function Subjects(): JSX.Element;
