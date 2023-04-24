import {
  Options,
  FormRules,
} from 'CommonTypes';
import { User } from 'DBModels';
import { ROLES } from 'globalStore/constants';
import BaseState from 'plugins/mobx/BaseState';


export interface Props {
  studyGroupsOptions: Options<number>,
  departmentsOptions: Options<number>,
  changed: User,
  onChange: () => {},
}

export interface FormData {
  login: string,
  email: string,
  firstName: string,
  lastName: string,
  patronymic: string,
  phone: string,
  role: ROLES
  studyGroupId?: number,
  departmentId?: number,
}

export class State extends BaseState<Props> {
  rules: FormRules;
  visible: BooleanState;
  loading: BooleanState;
  static create(): State;
  change(formData: FormData): void;
}

/**
 * Модальное окно редактирования пользователя
 */
export default function ChangeUserModalButton(props: Props): JSX.Element;
