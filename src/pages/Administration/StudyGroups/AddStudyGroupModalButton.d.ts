import { Moment } from 'moment';

import {
  Options,
  FormRules,
} from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  departmentsOptions: Options<number>;
  onAdd: () => {};
}

export interface FormData {
  shortName: string;
  fullName: string;
  code: number;
  groupNumber: number;
  courseNumber: number;
  yearOfStudyStart: Moment;
  idDepartment: number;
}

export class State extends BaseState<Props>{
  rules: FormRules;
  visible: BooleanState;
  loading: BooleanState;
  yearOfStudyStartInitial: Moment;
  static create(): State;
  add(formData: FormData): void;
}

/**
 * Модальное окно добавления факультета
 */
export default function AddStudyGroupModalButton(props: Props): JSX.Element;
