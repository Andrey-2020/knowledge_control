import { TableColumnType } from 'antd';
import { reaction } from 'mobx';

import { Options } from 'CommonTypes';
import {
  Work,
  Task,
  PassedThemes,
  Subject,
  StudyGroup,
  User,
} from 'DBModels';
import { MARK_TYPES } from 'globalStore/constants';
import { Selector } from 'utils/createSelector';


/**
 * Опции в селекторе работ/тестов
 */
export declare const worksOrTestsOptions: Options<string> = [
  {
    value: 'works',
    label: 'Работы',
  },
  {
    value: 'tests',
    label: 'Тесты',
  },
];

export declare type Mark = {
  mark: MARK_TYPES,
  teacherComment: string,
};

// Нахера описывать State, если он используется только внутри компонента?

/**
 * Таблица студентов с показанными результатами тестов/работ
 */
export default function GroupTable(): JSX.Element;

