import {
  Options,
  FormRules,
} from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  subjectsOptions: Options<number>,
  onAdd: () => {},
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
  add(formData: FormData): void;
}

/**
 * Модальное окно добавления факультета
 */
export default function AddSubjectSemesterModalButton(props: Props): JSX.Element;
