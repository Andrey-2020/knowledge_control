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
  Skeleton,
  Select,
  message,
  Button,
  Input,
  Form,
  DatePicker,
  Tooltip,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  useHistory,
  useParams,
} from 'react-router-dom';
import debounce from 'lodash/debounce';
import { marked } from 'marked';
import Dompurify from 'dompurify';
import moment from 'moment';

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
  urlParams = { actionId: '' };

  loadingActionTypes = new BooleanState(true);
  loadingAction = new BooleanState(true);

  actionTypes = [];

  formRules = {
    title: [required.name],
    actionTypeId: [required.default],
    actionDate: [required.default],
    description: [required.default],
  };

  actionTypeSearch = new SettedState('');

  /** @type {import('DBModels').Action} */
  target = {
    id: 0,
    title: '',
    actionTypeId: 0,
    actionDate: [0, 0, 0],
    description: '',
    users: [],
  };

  description = '';
  descriptionSet = debounce(action((event) => { this.description = event.target.value; }), 1000);

  constructor() {
    super();
    makeObservable(this, {
      actionTypes: observable.shallow,
      formRules: observable,
      target: observable.ref,
      description: observable,
      descriptionMarkdown: computed,
      actionTypesOptions: computed,
      toActionsList: action.bound,
      getActionTypes: action.bound,
      getAction: action.bound,
      addLazyAndSetActionType: action.bound,
      editAction: action.bound,
      openMarkdownCheetsheet: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get loading() {
    return this.loadingActionTypes.value ||
      this.loadingAction.value;
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
    this.loadingActionTypes.value = true;
    http.get('/action/type/all')
    .then((response) => {
      runInAction(() => {
        this.actionTypes = response.data;
      });
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось получить типы мероприятий', error), 5);
    })
    .finally(this.loadingActionTypes.setFalse);
  }

  getAction() {
    this.loadingAction.value = true;
    http.get('/action', { params: { id: this.urlParams.actionId } })
    .then((response) => {
      runInAction(() => {
        this.target = response.data;
        // Месяц нчинается с 0
        const actionDate = this.target.actionDate.slice();
        actionDate[1]--;

        this.formInstance.setFieldsValue({
          title: this.target.title,
          actionTypeId: this.target.actionType.id,
          actionDate: moment(actionDate),
          description: this.target.description,
        });
        this.description = this.target.description;
      });
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось получить данные мероприятия', error), 5);
    })
    .finally(this.loadingAction.setFalse);
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

  editAction() {
    this.formInstance.validateFields()
    .then(
      /** @param {import('./EditAction').FormData} formData */
      async (formData) => {
        this.loadingAction.setTrue();
        try {
          // Если тип мероприятия новый, то сначала получить его
          if (typeof formData.actionTypeId === 'string') {
            const response = await http.post('/action/type', undefined,
              { params: { type: formData.actionTypeId } });
            this.getActionTypes();
            formData.actionTypeId = response.data.id;
          }
          formData.actionType = formData.actionTypeId;
          formData.actionDate = formData.actionDate.format('YYYY-MM-DD');

          await http.put(`/action/${this.target.id}`, {
            ...this.target,
            ...formData,
          });
          message.success('Мероприятие отредактировано', 3);
          this.getAction();

        } catch (error) {
          message.error(http.parseError('Не удалось добавить мероприятие', error), 5);
        } finally {
          this.loadingAction.setFalse();
        }
      }
    )
    .catch(emptyFunction);
  }

  openMarkdownCheetsheet() {
    window.open('https://github.com/sandino/Markdown-Cheatsheet', '_blank');
  }
}

function EditAction() {
  /** @type {{ actionId: string }} */
  const params = useParams();
  const history = useHistory();

  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(params.actionId))) {
    history.push('/actions');
    return;
  }

  const state = useState(State.create)[0];
  state.history = history;
  state.urlParams = params;
  state.formInstance = Form.useForm()[0];
  useOnce(state.getActionTypes);
  useOnce(state.getAction);

  return (
    <>
      <div className="mb-3">
        <Button onClick={state.toActionsList}>
          К списку мероприятий
        </Button>
      </div>
      <Skeleton
        active
        loading={state.loading}
      >
        <Form
          layout="horizontal"
          form={state.formInstance}
          onFinish={state.editAction}
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
            Редактировать мероприятие
          </Button>
        </Form>
      </Skeleton>
    </>
  );
}
export default observer(EditAction);
