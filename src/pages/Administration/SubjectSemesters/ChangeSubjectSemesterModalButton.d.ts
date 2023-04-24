import {
  Options,
  FormRules,
} from 'CommonTypes';
import { SubjectSemester } from 'DBModels';
import { CONTROL_TYPES } from 'globalStore/constants';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  subjectsOptions: Options<number>,
  changed: SubjectSemester,
  onChange: () => {},
}

export interface FormData {
  numberOfSemester: number,
  controlType: CONTROL_TYPES,
  hasCourseWork: boolean,
  hasCourseProject: boolean,
  subjectId: number,
}

export class State extends BaseState<Props> {
  rules: FormRules;
  visible: BooleanState;
  loading: BooleanState;
  static create(): State;
  change(formData: FormData): void;
}

/**
 * Модальное окно редактирования кафедры
 */
export default function ChangeSubjectSemesterModalButton(props: Props): JSX.Element;
