
import { Department } from 'DBModels';
import {
  Options,
  FormRules,
} from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  facultiesOptions: Options<number>;
  changed: Department;
  onChange: () => {};
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
  change(formData: FormData): void;
}

/**
 * Модальное окно редактирования кафедры
 */
export default function ChangeDepartmentModalButton(props: Props): JSX.Element;
