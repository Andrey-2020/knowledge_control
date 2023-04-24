import { Subject } from 'DBModels';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


class State extends BaseState<undefined> {
  subjectList: Subject[];
  loading: BooleanState;

  static create(): State;

  getSubjects(): void;
}
/**
 * Страница со списком предметов пользователя
 */
export default function SubjectList(): JSX.Element;
