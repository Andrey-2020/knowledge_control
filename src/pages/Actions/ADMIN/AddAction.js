import React, { useState } from 'react';
import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';
import { observer } from 'mobx-react';
import {
  Select,
  message,
  Button,
  Input,
  Form,
  DatePicker,
  Tooltip,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { marked } from 'marked';
import Dompurify from 'dompurify';

import BaseState from 'plugins/mobx/BaseState';
import {
  BooleanState,
  SettedState,
} from 'plugins/mobx/fields';
import useOnce from 'utils/useOnce';
import createOptions from 'utils/createOptions';
import http from 'plugins/http';
import { required } from 'utils/formRules';
import { emptyFunction } from 'utils/empties';


class State extends BaseState {
  loading = new BooleanState(true);
  actionTypes = [];

  formRules = {
    title: [required.name],
    actionTypeId: [required.default],
    actionDate: [required.default],
    description: [required.default],
  };

  actionTypeSearch = new SettedState('');

  description = '';
  descriptionSet = debounce(action((event) => { this.description = event.target.value; }), 1000);

  constructor() {
    super();
    makeObservable(this, {
      actionTypes: observable.shallow,
      formRules: observable,
      description: observable,
      descriptionMarkdown: computed,
      actionTypesOptions: computed,
      toActionsList: action.bound,
      getActionTypes: action.bound,
      addLazyAndSetActionType: action.bound,
      addAction: action.bound,
      openMarkdownCheetsheet: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get descriptionMarkdown() {
    return {
      __html: Dompurify.sanitize(marked.parse(this.description)),
    };
  }

  get actionTypesOptions() {
    return createOptions(this.actionTypes, 'id', 'type');
  }

  toActionsList() {
    this.history.push('/actions');
  }

  getActionTypes() {
    http.get('/action/type/all')
    .then((response) => {
      runInAction(() => {
        this.actionTypes = response.data;
      });
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось получить типы мероприятий', error), 5);
    })
    .finally(this.loading.setFalse);
  }

  /** @param {KeyboardEvent} event */
  addLazyAndSetActionType(event) {
    if (event.code !== 'Enter') {
      return;
    }
    this.actionTypes.push({
      id: this.actionTypeSearch.value,
      type: this.actionTypeSearch.value,
    });
    this.formInstance.setFieldsValue({ actionTypeId: this.actionTypeSearch.value });
  }

  addAction() {
    this.formInstance.validateFields()
    .then(
      /** @param {import('./AddAction').FormData} formData */
      async (formData) => {
        this.loading.setTrue();
        try {
          // Если тип мероприятия новый, то сначала получить его
          if (typeof formData.actionTypeId === 'string') {
            const response = await http.post('/action/type', undefined,
              { params: { type: formData.actionTypeId } });
            formData.actionTypeId = response.data.id;
          }
          formData.actionDate = formData.actionDate.format('YYYY-MM-DD');

          await http.post('/action', formData);
          message.success('Мероприятие добавлено', 3);
          this.history.push('/actions');

        } catch (error) {
          this.loading.setFalse();
          message.error(http.parseError('Не удалось добавить мероприятие', error), 5);
        }
      }
    )
    .catch(emptyFunction);
  }

  openMarkdownCheetsheet() {
    window.open('https://github.com/sandino/Markdown-Cheatsheet', '_blank');
  }
}

function AddAction() {
  const history = useHistory();

  const state = useState(State.create)[0];
  state.history = history;
  state.formInstance = Form.useForm()[0];
  useOnce(state.getActionTypes);

  return (
    <>
      <div className="mb-3">
        <Button onClick={state.toActionsList}>
          К списку мероприятий
        </Button>
      </div>
      <Form
        layout="horizontal"
        form={state.formInstance}
        onFinish={state.addAction}
      >
        <Form.Item
          name="title"
          label="Название мероприятия"
          rules={state.formRules.title}
        >
          <Input placeholder="Название мероприятия" />
        </Form.Item>
        <Form.Item
          name="actionTypeId"
          label="Тип мероприятия"
          extra={(
            <small>
              Новые тип можно добавить
              <br/>
              просто нажав "Enter"
            </small>
          )}
          rules={state.formRules.actionTypeId}
        >
          <Select
            style={{ width: '200px' }}
            showSearch
            placeholder="Тип мероприятия"
            notFoundContent="Enter чтобы добавить тип"
            options={state.actionTypesOptions}
            searchValue={state.actionTypeSearch.value}
            onSearch={state.actionTypeSearch.set}
            onInputKeyDown={state.addLazyAndSetActionType}
          />
        </Form.Item>
        <Form.Item
          name="actionDate"
          label="Дата мероприятия"
          rules={state.formRules.actionDate}
        >
          <DatePicker placeholder="Дата мероприятия" />
        </Form.Item>
        <h6 className="text-center">
          Описание:
          <Tooltip
            title={`Описание оформляется разметкой Markdown.
              Чтобы получить подсказки, нажмите на этот вопросик`}
          >
            <QuestionCircleOutlined
              className="ml-2"
              onClick={state.openMarkdownCheetsheet}
            />
          </Tooltip>
        </h6>
        <div className="w-100 d-flex my-3">
          <div className="col-6">
            <div>Исходный разметка Markdown</div>
            <Form.Item
              name="description"
              rules={state.formRules.description}
              initialValue=""
            >
              <Input.TextArea
                autoSize
                onChange={state.descriptionSet}
              />
            </Form.Item>
          </div>
          <div className="col-6">
            <div>Предварительный просмотр</div>
            <div
              className="border p-2 text-light-5-bg"
              style={{ height: 'calc(100% - 22px)' }}
            >
              <div
                className="h-100 max-width-100-inners"
                dangerouslySetInnerHTML={state.descriptionMarkdown}
              />
            </div>
          </div>
        </div>
        <Button
          block
          size="large"
          type="primary"
          htmlType="submit"
        >
          Создать мероприятие
        </Button>
      </Form>
    </>
  );
}
export default observer(AddAction);
