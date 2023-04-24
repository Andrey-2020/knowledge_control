import { Moment } from 'moment';

import {
  Options,
  FormRules,
} from 'CommonTypes';
import { StudyGroup } from 'DBModels';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  departmentsOptions: Options<number>,
  changed: StudyGroup,
  onChange: () => {},
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

export class State extends BaseState<Props> {
  rules: FormRules;
  visible: BooleanState;
  loading: BooleanState;
  yearOfStudyStartInitial: Moment;
  static create(): State;
  change(formData: FormData): void;
}

/**
 * Модальное окно редактирования кафедры
 */
export default function ChangeStudyGroupModalButton(props: Props): JSX.Element;
