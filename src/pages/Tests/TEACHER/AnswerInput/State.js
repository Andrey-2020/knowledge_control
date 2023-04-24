import {
  makeObservable,
  observable,
  action,
} from 'mobx';

import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<import('./index').Props>} */
export default class State extends BaseState {
  /**
   * Чтобы менять объект вопроса в массиве
   * @type {import('./index').Props['answer']}
   */
  initialAnswerRef = null;

  answer = {
    key: '',
    text: '',
    right: false,
    strict: false,
  };
  
  constructor() {
    super();
    makeObservable(this, {
      answer: observable.shallow,
      setProps: action.bound,
      setAnswerKey: action.bound,
      setAnswerText: action.bound,
      setAnswerRight: action.bound,
      setAnswerStrict: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /** @param {import('./index').Props} props */
  setProps(props) {
    if (this.initialAnswerRef !== props.answer) {
      this.initialAnswerRef = props.answer;
      this.answer.key = props.answer.key;
      this.answer.right = props.answer.right;
      this.answer.strict = props.answer.strict;
      this.answer.text = props.answer.text;
    }
    this.props = props;
  }

  setAnswerKey(event) {
    const value = event.target.value;
    this.answer.key = value;
    this.initialAnswerRef.key = value;
  }

  setAnswerText(event) {
    const value = event.target.value;
    this.answer.text = value;
    this.initialAnswerRef.text = value;
  }

  setAnswerRight(event) {
    const value = event.target.checked;
    this.answer.right = value;
    this.initialAnswerRef.right = value;
  }

  setAnswerStrict(event) {
    const value = event.target.checked;
    this.answer.strict = value;
    this.initialAnswerRef.strict = value;
  }
}
