import { Faculty } from 'DBModels';
import { FormRules } from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  changed: Faculty;
  onChange: () => {};
}

export interface FormData {
  shortName: string;
  fullName: string;
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
export default function ChangeFacultyModalButton(props: Props): JSX.Element;
