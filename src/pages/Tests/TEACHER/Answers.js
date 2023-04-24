import {
  makeObservable,
  observable,
  action,
} from 'mobx';

import { QUESTIONS_TYPES } from 'globalStore/constants';


export default class Answers {
  /** @type {import('./AddQuestionModal').Answer[]} */
  value = [];

  constructor() {
    makeObservable(this, {
      value: observable.shallow,
      add: action.bound,
      delete: action.bound,
      clear: action.bound,
    });
  }

  add() {
    this.value.push({
      key: '',
      text: '',
      right: false,
      strict: false,
    });
  }

  delete(index) {
    this.value.splice(index, 1);
  }

  clear() {
    this.value.splice(0, this.value.length);
  }

  /**
   * @param {QUESTIONS_TYPES} questionType
   * @returns {import('./AddQuestionModal').AnswerForServer[]}
   */
  parseForServer(questionType) {
    /** @type {import('./AddQuestionModal').AnswerForServer[]} */
    const result = [];

    if (questionType === QUESTIONS_TYPES.SELECT) {
      for (const answer of this.value) {
        result.push({
          answer: answer.text,
          isRight: answer.right,
        });
      }
    } else if (questionType === QUESTIONS_TYPES.MATCH) {
      for (const answer of this.value) {
        result.push({
          key: { answer: answer.key },
          value: { answer: answer.text },
        });
      }
    } else if (questionType === QUESTIONS_TYPES.SEQUENCE) {
      for (const answer of this.value) {
        result.push({
          answer: answer.text,
          isRight: true,
        });
      }
    } else if (questionType === QUESTIONS_TYPES.WRITE) {
      for (const answer of this.value) {
        result.push({
          answer: answer.text,
          isStrict: answer.strict,
        });
      }
    }

    return result;
  }
}