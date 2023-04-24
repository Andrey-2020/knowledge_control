import React, { useState } from 'react';
import {
  message,
  Spin,
  Form,
  Input,
  InputNumber,
  Button,
} from 'antd';
import {
  makeObservable,
  observable,
  action,
  runInAction,
} from 'mobx';
import { observer } from 'mobx-react';
import {
  useHistory,
  useParams,
} from 'react-router-dom';

import BaseState from 'plugins/mobx/BaseState';
import {
  SettedState,
  BooleanState,
} from 'plugins/mobx/fields';
import useOnce from 'utils/useOnce';
import http from 'plugins/http';
import { required } from 'utils/formRules';
import QuestionsInTest from 'pages/Tests/TEACHER/QuestionsInTest';


class State extends BaseState {
  /** @type {import('./index').UrlParams} */
  urlParams = {};

  loading = new BooleanState(true);
  /** @type {import('DBModels').Theme} */
  target = {
    id: 0,
    name: '',
    decryption: '',
    attemptNumberInTest: 0,
    questionQuantityInTest: 0,
    subjectId: 0,
  };
  /** @type {SettedState<import('DBModels').Question[]>} */
  questions = new SettedState([], true);

  rules = {
    name: [required.name],
    decryption: [required.decryption],
    questionQuantityInTest: [],
    attemptNumberInTest: [],
  };

  constructor() {
    super();
    makeObservable(this, {
      target: observable.ref,
      questions: observable,
      getTheme: action.bound,
      edit: action.bound,
    });
  }

  static create() {
    return new State();
  }

  getTheme() {
    Promise.all([
      http.get('/api/testing/themes', {
        params: { subj_id: this.urlParams.subjectId },
      })
      .then((response) => {
        runInAction(() => {
          this.target = response.data.find((theme) => theme.id === Number(this.urlParams.themeId));
          this.formInstance.setFieldsValue(this.target);
        });
      }),
      http.get('/api/testing/all-questions', {
        params: { theme_id: this.urlParams.themeId },
      })
      .then((response) => {
        this.questions.set(response.data);
      }),
    ])
    .catch((error) => {
      message.error(http.parseError('Не удалось получить тему', error), 5);
      return Promise.reject();
    })
    .finally(this.loading.setFalse);
  }

  /** @param {import('./index').FormData} formData */
  edit(formData) {
    this.loading.value = true;

    Promise.all([
      http.put('/api/testing/theme', {
        ...this.target,
        formData,
      })
      .catch((error) => {
        message.error(http.parseError('Не удалось изменить тему', error), 5);
        return Promise.reject();
      }),
      http.put('/api/testing/questions', {
        questionIns: this.questions,
        subjectId: this.urlParams.subjectId,
        themeId: this.urlParams.themeId,
      })
      .catch(http.ifNotCancel((error) => {
        message.error(http.parseError('Не удалось изменить список вопросов', error), 5);
        return Promise.reject();
      })),
    ])
    .then(() => {
      message.success('Тема изменена', 3);
      this.history.push(`/subjects/${this.urlParams.subjectId}/tests`);
    })
    .catch(() => {
      this.loading.setFalse();
    });
  }
}

function EditTest() {
  const history = useHistory();
  /** @type {import('./index').UrlParams} */
  const params = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(params.subjectId)) || isNaN(Number(params.themeId))) {
    history.push('/subjects');
    return;
  }

  const state = useState(State.create)[0];
  state.history = history;
  state.urlParams = params;
  state.formInstance = Form.useForm()[0];
  useOnce(state.getTheme);

  return (
    <Spin spinning={state.loading.value}>
      <Form
        layout="vertical"
        form={state.formInstance}
        onFinish={state.edit}
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
export default observer(EditTest);
