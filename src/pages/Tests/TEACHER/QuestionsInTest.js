import React, { useState } from 'react';
import {
  Table,
} from 'antd';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import BaseState from 'plugins/mobx/BaseState';
import AddQuestionModal from 'pages/Tests/TEACHER/AddQuestionModal';
// import EditQuestionModal from 'pages/Tests/TEACHER/EditQuestionModal';


/** @extends {BaseState<import('./QuestionsInTest').Props>} */
class State extends BaseState {
  /** @type {import('DBModels').Question[]} */
  initialQuestions = [];
  /** @type {import('DBModels').Question[]} */
  questions = [];

  constructor() {
    super();
    makeObservable(this, {
      initialQuestions: observable.ref,
      questions: observable.shallow,
      columns: computed,
      setProps: action.bound,
      addQuestion: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get columns() {
    /** @type {import('antd/lib/table').ColumnsType<import('DBModels').Question>} */
    const result  = [
      {
        title: 'Номер',
        render: (_, __, index) => String(index + 1),
      },
      {
        title: 'Вопрос',
        dataIndex: 'question',
      },
      {
        title: 'Тип вопроса',
        dataIndex: 'questionType',
      },
      {
        title: 'Файлы',
        dataIndex: 'fileIds',
        render: (_) => {
          return '';
        },
      },
      {
        title: 'Ответы',
        dataIndex: 'answerChoiceList',
        render: (value, record) => {
          return 'Rano';
        },
      },
      {
        title: 'Правильные ответы',
        dataIndex: 'rightAnswers',
        render: (_) => {
          return 'Rano';
        },
      },
      {
        title: 'Сложность',
        dataIndex: 'complexity',
      },
      {
        title: 'Действия',
        key: 'actions',
        render: (_, record) => {
          return 'Rano';
          // this.props.onChange(this.questions);
        },
      },
    ];
    return result;
  }

  /** @param {import('./QuestionsInTest').Props} props */
  setProps(props) {
    if (props.questions && !isEqual(props.questions, this.initialQuestions)) {
      this.initialQuestions = props.questions;
      this.questions = cloneDeep(props.questions);
    }
    this.props = props;
  }

  /** @param {import('../../Test').NewQuestion} question */
  addQuestion(question) {
    this.questions.push(question);
    this.props.onChange(this.questions.slice());
  }
}

/**
 * Отображение вопросов теста
 *  
 * @param {import('./QuestionsInTest').Props} props
 */
function QuestionsInTest(props) {
  const state = useState(State.create)[0];
  state.setProps(props);

  return (
    <Table
      bordered
      rowKey="question"
      columns={state.columns}
      dataSource={state.questions}
      title={() => (
        <AddQuestionModal onAdd={state.addQuestion}/>
      )}
    />
  );
}
export default observer(QuestionsInTest);
