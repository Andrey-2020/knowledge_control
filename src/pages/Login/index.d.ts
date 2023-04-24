import { History } from 'history';

import {
  FormRules,
  Rule,
} from 'CommonTypes';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


export interface FormData {
  login: string;
  password: string;
}

export class State extends BaseState<undefined> {
  rules: {
    login: Rule[];
    password: Rule[];
  };
  loading: BooleanState;
  static create(): State;
  send(formData: FormData): void;
  toMainPage(): void;
}

/**
 * Компонент страницы входа
 */
export default function Login(): JSX.Element;
