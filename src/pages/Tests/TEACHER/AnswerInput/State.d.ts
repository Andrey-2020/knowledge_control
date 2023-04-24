import BaseState from 'plugins/mobx/BaseState';
import { Props } from './index';
import { Answer } from '../AddQuestionModal';


export default class State extends BaseState<Props> {
  /** Чтобы менять объект вопроса в массиве */
  initialAnswerRef: Props['answer'];

  answer: Answer;

  static create(): State;

  setProps(props: Props): void;

  setAnswerKey(event: InputEvent): void;

  setAnswerText(event: InputEvent): void;

  setAnswerRight(event: InputEvent): void;

  setAnswerStrict(event: InputEvent): void;
}
