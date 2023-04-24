import {
  Options,
  FormRules,
} from 'CommonTypes';
import { Subject } from 'DBModels';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  departmentsOptions: Options<number>,
  changed: Subject,
  onChange: () => {},
}

export interface FormData {
  name: string,
  decryption: string,
  departmentId: number,
}

export class State extends BaseState<Props> {
  rules: FormRules;
  visible: BooleanState;
  loading: BooleanState;
  static create(): State;
  change(formData: FormData): void;
}

/**
 * Модальное окно редактирования факультета
 */
export default function ChangeSubjectModalButton(props: Props): JSX.Element;
