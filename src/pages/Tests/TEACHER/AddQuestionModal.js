import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  makeObservable,
  observable,
  computed,
  action,
  reaction,
} from 'mobx';
import { observer } from 'mobx-react';

import {
  maxLength,
  required,
} from 'utils/formRules';
import {
  QUESTIONS_TYPES,
  questionTypeTranslatorOptions,
} from 'globalStore/constants';
import BaseState from 'plugins/mobx/BaseState';
import {
  SettedState,
  BooleanState,
} from 'plugins/mobx/fields';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';
import Answers from 'pages/Tests/TEACHER/Answers';
import AnswerSelectInput from 'pages/Tests/TEACHER/AnswerInput/SELECT';
import AnswerMatchInput from 'pages/Tests/TEACHER/AnswerInput/MATCH';
import AnswerSequenceInput from 'pages/Tests/TEACHER/AnswerInput/SEQUENCE';
import AnswerWriteInput from 'pages/Tests/TEACHER/AnswerInput/WRITE';


const componentBtQuestionType = {
  [QUESTIONS_TYPES.SELECT]: AnswerSelectInput,
  [QUESTIONS_TYPES.MATCH]: AnswerMatchInput,
  [QUESTIONS_TYPES.SEQUENCE]: AnswerSequenceInput,
  [QUESTIONS_TYPES.WRITE]: AnswerWriteInput,
};

/** @extends {BaseState<import('./AddQuestionModal').Props>} */
class State extends BaseState {
  visible = new BooleanState(false);

  rules = {
    question: [
      required.name,
      maxLength.standard,
    ],
    questionType: [],
    fileIds: [],
    answers: [],
    rightAnswers: [],
    complexity: [],
  };

  questionType = new SettedState(QUESTIONS_TYPES.SELECT);
  answers = new Answers();

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      answersComponent: computed,
      add: action.bound,
      createClearAnswersReaction: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get answersComponent() {
    const Component = componentBtQuestionType[this.questionType.value];
    // Компоненты сами контролируют данные вопроса
    return this.answers.value.map((answer, index) => (
      <Component
        key={index}
        answer={answer}
        onDelete={() => { this.answers.delete(index); }}
      />
    ));
  }

  /** @param {import('./AddQuestionModal').FormData} formData */
  add(formData) {
    if (!this.answers.value.length) {
      message.error('Необходим хотя бы один ответ', 3);
      return;
    }

    /** @type {import('../Test').NewQuestion} */
    const result = formData;
    result.answers = this.answers.parseForServer(this.questionType.value);
    result.fileIds = [];

    this.props.onAdd(result);
    this.visible.value = false;
    this.formInstance.resetFields();
    this.answers.clear();
  }

  createClearAnswersReaction() {
    return reaction(
      () => this.questionType.value,
      this.answers.clear,
    );
  }
}

/**
 * Модальное окно добавления вопроса теста
 * 
 * @param {import('./AddQuestionModal').Props} props
 */
function AddQuestionModal(props) {
  const state = useState(State.create)[0];
  state.props = props;
  state.formInstance = Form.useForm()[0];
  useOnceWithRevoke(state.createClearAnswersReaction);

  return (
    <>
      <Button
        type="primary"
        onClick={state.visible.setTrue}
      >
        Добавить вопрос
      </Button>
      <Modal
        title="Добавление нового вопроса"
        visible={state.visible.value}
        footer={null}
        onOk={state.visible.setFalse}
        onCancel={state.visible.setFalse}
      >
        <Form
          layout="vertical"
          form={state.formInstance}
          onFinish={state.add}
        >
          <Form.Item
            label="Вопрос:"
            name="question"
            rules={state.rules.question}
          >
            <Input placeholder="Вопрос"/>
          </Form.Item>
          <Form.Item
            label="Тип вопроса:"
            name="questionType"
            rules={state.rules.questionType}
            initialValue={QUESTIONS_TYPES.SELECT}
          >
            <Select
              placeholder="Тип вопроса"
              options={questionTypeTranslatorOptions()}
              onChange={state.questionType.set}
            />
          </Form.Item>
          {/* <Form.Item
            label="Файлы:"
            name="fileIds"
            rules={rules.questionType}
            initialValue={[]}
          >
            
          </Form.Item> */}
          <Form.Item label="Ответы:">
            <Space
              className="w-100"
              direction="vertical"
            >
              {state.answersComponent}
              <Button onClick={state.answers.add}>
                <PlusOutlined/>
                Ещё один
              </Button>
            </Space>
          </Form.Item>
          <Form.Item
            label="Сложность:"
            name="complexity"
            rules={state.rules.complexity}
            initialValue={3}
          >
            <InputNumber
              placeholder="Сложность"
              min={3}
              max={5}
            />
          </Form.Item>
          <Button
            className="w-100"
            type="primary"
            htmlType="submit"
          >
            Добавить
          </Button>
        </Form>
      </Modal>
    </>
  );
}
export default observer(AddQuestionModal);
