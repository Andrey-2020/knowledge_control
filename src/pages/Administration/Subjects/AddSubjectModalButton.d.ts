import {
  Options,
  FormRules,
} from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  departmentsOptions: Options<number>,
  onAdd: () => {},
}

export interface FormData {
  name: string,
  decryption: string,
  departmentId?: number,
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
export default function AddSubjectModalButton(props: Props): JSX.Element;
