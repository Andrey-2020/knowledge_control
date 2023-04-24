
import { FormRules } from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  onAdd: () => {};
}

export interface FormData {
  shortName: string;
  fullName: string;
}

export class State extends BaseState<Props> {
  visible: BooleanState;
  rules: FormRules;
  loading: BooleanState;
  static create(): State;
  add(formData: FormData): void;
}

/**
 * Модальное окно добавления факультета
 */
export default function AddFacultyModalButton(props: Props): JSX.Element;
