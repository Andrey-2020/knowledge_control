import { TableColumnType } from 'antd';

import {
  Subject,
  StudyGroup,
  SubjectSemester
} from 'DBModels';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import createOptions from 'utils/createOptions';


export class State {
  subjects: Subject[];
  studyGroups: StudyGroup[];
  subjectSemesters: SubjectSemester[];

  loading: BooleanState;
  selected: SettedState<number[]>;

  static create(): State;

  get subjectsOptions(): ReturnType<typeof createOptions>;

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
 * Страница CRUD семестров
 */
export default function SubjectSemesters(): JSX.Element;
