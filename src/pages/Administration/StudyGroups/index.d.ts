import { TableColumnType } from 'antd';

import {
  Department,
  SubjectSemester,
  StudyGroup,
} from 'DBModels';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import createOptions from 'utils/createOptions';


export class State {
  departments: Department[];
  subjectSemesters: SubjectSemester;
  studyGroups: StudyGroup[];
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

  updateSchedule(): void;
}

/**
 * Страница CRUD студенческих групп
 */
export default function StudyGroups(): JSX.Element;
