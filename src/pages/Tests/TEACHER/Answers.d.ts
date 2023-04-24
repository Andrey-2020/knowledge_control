import {
  makeObservable,
  observable,
  action,
} from 'mobx';

import { QUESTIONS_TYPES } from 'globalStore/constants';
import {
  Answer,
  AnswerForServer,
} from './AddQuestionModal';


export default class Answers {
  value: Answer[];

  add(): void;

  delete(index: number): void;

  clear(): void;

  parseForServer(questionType: QUESTIONS_TYPES): AnswerForServer;
}