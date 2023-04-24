import { StudyGroup } from 'DBModels';
import { BooleanState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';


class State extends BaseState<undefined> {
  groups: StudyGroup[];
  loading: BooleanState;

  static create(): State;

  get groupsComponent(): JSX.Element[];
  get component(): JSX.Element;

  getTeachingStudyGroups(): void;
}

/**
 * Отображение списка групп студентов
 */
export default function GroupList(): JSX.Element;
