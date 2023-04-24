import { UserContact } from 'DBModels';
import { USER_CONTACT_TYPES } from 'globalStore/constants';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface FormData {
  type: USER_CONTACT_TYPES;
  value: string;
}

export class State extends BaseState<undefined> {
  contacts: UserContact[];

  visible: BooleanState;
  loading: BooleanState;

  static create(): State;

  get contactComponent(): JSX.Element[];
  get typesRadioButtonsComponent(): JSX.Element[];

  getContacts(): void;
  add(formData: FormData): void;
}

/** Модальное окно дополнительных контактов пользователя */
export default function Contacts(): JSX.Element;
