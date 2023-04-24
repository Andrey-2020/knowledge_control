import { TableColumnType } from 'antd';

import {
  Faculty,
  StudyGroup,
  Subject,
  Department,
} from 'DBModels';
import { TranslationCacheComponent } from 'globalStore/Internationalization';
import { Selector } from 'utils/createSelector';
import createOptions from 'utils/createOptions';


export class State {
  cachedTranslations: TranslationCacheComponent;
  faculties: Faculty[];
  studyGroups: StudyGroup[];
  subjects: Subject[];
  departments: Department[];
  loading: BooleanState;
  selected: SettedState;

  static create(): State;

  get facultiesOptions(): ReturnType<typeof createOptions>;

  get facultiesSelector(): Selector<Faculty>;

  get studyGroupsSelector(): Selector<StudyGroup>;

  get subjectsSelector(): Selector<Subject>;

  get columns(): TableColumnType[];

  get rowSelection(): {
    selectedRowKeys: number[];
    onChange: () => void;
  };

  setData(data: [
    Faculty[],
    StudyGroup[],
    Subject[],
    Department[],
  ]): void;

  getDataSourceOnce(): void;

  updateTable(): void;

  delete(ids: number[]): void

  deleteSelected(): void;
}

/**
 * Страница CRUD кафедр
 */
export default function Departments(): JSX.Element;
