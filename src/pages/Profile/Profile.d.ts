import { RcFile } from 'antd/lib/upload';

import { BooleanState } from 'plugins/mobx/fields';
import { FormRules } from 'CommonTypes';
import BaseState from 'plugins/mobx/BaseState';


export interface FormData {
  login: string;
  email: string;
  phone: string;
}

export class State extends BaseState<undefined> {
  rules: FormRules;
  loading: BooleanState;

  static create(): State;

  get avatarImageComponent(): JSX.Element;
  get studyGroupOrDepartmentComponent(): JSX.Element;

  setFalseLoadingWhenUserLoaded(): void;
  change(formData: FormData): void;
  uploadAvatar(file: RcFile): false;
}

/** Страница профиля пользователя */
export default function Profile(): JSX.Element;
