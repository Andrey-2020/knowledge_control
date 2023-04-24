import {
  Options,
  FormRules,
} from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  studyGroupsOptions: Options<number>,
  departmentsOptions: Options<number>,
  onAdd: () => {},
}

export interface FormData {
  login: string,
  password: string,
  repeatedPassword: string,
  email: string,
  firstName: string,
  lastName: string,
  patronymic: string,
  phone: string,
  role: ROLES,
  studyGroupId?: number,
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
 * Модальное окно регистрации нового пользователя
 */
export default function AddUserModalButton(props: Props): JSX.Element;
