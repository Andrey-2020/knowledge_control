import {
  Options,
  FormRules,
} from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  facultiesOptions: Options<number>;
  onAdd: () => {};
}

export interface FormData {
  shortName: string;
  fullName: string;
  facultyId: number;
}

export class State extends BaseState<Props> {
  visible: BooleanState;
  loading: BooleanState;
  rules: FormRules;
  static create(): State;
  add(formData: FormData): void;
}

/**
 * Модальное окно добавления факультета
 */
export default function AddDepartmentModalButton(props: Props): JSX.Element;
