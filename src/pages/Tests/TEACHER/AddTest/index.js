import React, { useState } from 'react';
import {
  Form,
  Spin,
  Input,
  InputNumber,
  Button,
  message,
} from 'antd';
import {
  useParams,
  useHistory,
} from 'react-router-dom';
import {
  makeObservable,
  observable,
  action,
} from 'mobx';
import { observer } from 'mobx-react';

import http from 'plugins/http';
import QuestionsInTest from 'pages/Tests/TEACHER/QuestionsInTest';
import {
  required,
  maxLength,
} from 'utils/formRules';
import BaseState from 'plugins/mobx/BaseState';
import {
  SettedState,
  BooleanState,
} from 'plugins/mobx/fields';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  /** @type {import('./index').UrlParams} */
  urlParams = { subjectId: '' };

  questions = new SettedState([], true);
  loading = new BooleanState(false);

  rules = {
    subjectId: [],
    name: [
      required.name,
      maxLength.standard,
    ],
    decryption: [maxLength.standard],
    questionQuantityInTest: [],
    attemptNumberInTest: [],
  };

  constructor() {
    super();
    makeObservable(this, {
      rules: observable,
      add: action.bound,
    });
  }

  static create() {
    return new State();
  }

  /** @param {import('./index').FormData} formData */
  add(formData) {
    this.loading.value = true;
    formData.subjectId = Number(this.urlParams.subjectId);
    /** Добавляется тема */
    http.post('/api/testing/theme', formData)
    .then((response) => {
      /** Затем в неё добавляются вопросы */
      return http.post('/testing/new/questions', {
        subjectId: formData.subjectId,
        themeId: response.data,
        questionDataDtoList: this.questions.value,
      });
    })
    .then(() => {
      message.success('Тест успешно создан', 3);
      this.history.push(`/subjects/${this.urlParams.subjectId}/tests`);
    })
    .catch((error) => {
      message.error(http.parseError(
        'Не удалось создать тест', error), 5);
      this.loading.setFalse();
    });
  }
}

/**
 * Страница добавления теста
 */
function AddTest() {
  const history = useHistory();
  /** @type {import('./index').UrlParams} */
  const urlParams = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(urlParams.subjectId))) {
    history.push('/subjects');
    return;
  }

  const state = useState(State.create)[0];
  state.urlParams = urlParams;
  state.history = history;
  state.formInstance = Form.useForm()[0];

  return (
    <Spin spinning={state.loading.value}>
      <Form
        layout="vertical"
        form={state.formInstance}
        onFinish={state.add}
      >
        <Form.Item
          label="Название:"
          name="name"
          rules={state.rules.name}
        >
          <Input placeholder="Название"/>
        </Form.Item>
        <Form.Item
          label="Описание:"
          name="decryption"
          rules={state.rules.decryption}
        >
          <Input.TextArea placeholder="Описание"/>
        </Form.Item>
        <Form.Item
          label="Сложность вопросов:"
          name="questionQuantityInTest"
          rules={state.rules.questionQuantityInTest}
          initialValue={3}
        >
          <InputNumber
            placeholder="Сложность вопросов"
            min={3}
            max={5}
          />
        </Form.Item>
        <Form.Item
          label="Количество попыток решения:"
          name="attemptNumberInTest"
          rules={state.rules.attemptNumberInTest}
          initialValue={3}
        >
          <InputNumber
            placeholder="Количество попыток решения"
            min={1}
          />
        </Form.Item>
        <QuestionsInTest
          questions={state.questions.value}
          onChange={state.questions.set}
        />
        <Button
          type="primary"
          htmlType="submit"
        >
          Добавить
        </Button>
      </Form>
    </Spin>
  );
}
export default observer(AddTest);
