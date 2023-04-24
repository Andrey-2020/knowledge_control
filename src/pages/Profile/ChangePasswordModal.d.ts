import { FormRules } from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface FormData {
  newPassword: string;
  repeatedNewPassword: string;
}

export class State extends BaseState<undefined> {
  visible: BooleanState;
  loading: BooleanState;
  rules: FormRules;
  static create(): State;
  addRules(): void;
  changePassword(formData: FormData): void;
}

/**
 * Модальное окно изменения пароля
 */
export default function ChangePasswordModal(): JSX.Element;
