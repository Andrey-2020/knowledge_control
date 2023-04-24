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
  useHistory,
  useParams,
} from 'react-router-dom';
import {
  Skeleton,
  Button,
  message,
  Divider,
  Modal,
} from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import BaseState from 'plugins/mobx/BaseState';
import { BooleanState } from 'plugins/mobx/fields';
import http from 'plugins/http';
import store from 'globalStore';
import useOnce from 'utils/useOnce';
import { ROLES } from 'globalStore/constants';


/** @extends {BaseState<undefined>} */
class State extends BaseState {
  urlParams = { actionId: '' };

  loading = new BooleanState(true);
  /** @type {import('DBModels').Action} */
  action = {};

  addRemoveUserToActionLoading = new BooleanState(false);

  constructor() {
    super();
    makeObservable(this, {
      action: observable.ref,
      countUsersInAction: computed,
      currentUserInAction: computed,
      parsedActionDescription: computed,
      inviteUninviteToActionComponent: computed,
      editDeleteButtons: computed,
      toActionsList: action.bound,
      getAction: action.bound,
      addUserToAction: action.bound,
      deleteAction: action.bound,
      removeUserFromAction: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get countUsersInAction() {
    if (!this.action.users) {
      return null;
    }
    return this.action.users.length;
  }

  get currentUserInAction() {
    if (!this.action.users) {
      return false;
    }
    return Boolean(this.action.users.find((user) => user.id === store.userId));
  }

  get parsedActionDescription() {
    if (!this.action.description) {
      return undefined;
    }
    return { __html: DOMPurify.sanitize(
      marked.parse(this.action.description),
      { USE_PROFILES: { html: true } },
    )};
  }

  get inviteUninviteToActionComponent() {
    if (!this.action.users || !store.UserData.id) {
      return null;
    }

    if (this.currentUserInAction) {
      return (
        <Button
          type="danger"
          loading={this.addRemoveUserToActionLoading.value}
          onClick={this.removeUserFromAction}
        >
          Отсоединиться от мероприятия
        </Button>
      );
    }

    return (
      <Button
        type="primary"
        loading={this.addRemoveUserToActionLoading.value}
        onClick={this.addUserToAction}
      >
        Присоединиться к мероприятию
      </Button>
    );
  }

  get editDeleteButtons() {
    if (store.userRole !== ROLES.ADMIN) {
      return undefined;
    }

    return (
      <div>
        <Button
          type="primary"
          onClick={() => { this.history.push(`/actions/${this.urlParams.actionId}/edit`); }}
        >
          Редактировать мероприятие
        </Button>
        <Divider type="vertical" />
        <Button
          type="danger"
          onClick={this.deleteAction}
        >
          Удалить мероприятие
        </Button>
      </div>
    );
  }

  toActionsList() {
    this.history.push('/actions');
  }

  getAction() {
    http.get('/action', { params: { id: this.urlParams.actionId } })
    .then((response) => {
      runInAction(() => {
        this.action = response.data;
      });
      this.loading.setFalse();
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось получить данные мероприятия', error), 5);
      this.history.push('/actions');
    });
  }

  deleteAction() {
    Modal.confirm({
      title: 'Удаление мероприятия',
      content: `Вы действительно хотите удалить мероприятие "${this.action.title}"?`,
      okText: 'Удалить',
      cancelText: 'Нет',
      onOk: () => (
        http.delete('/action', { params: { id: this.urlParams.actionId } })
        .then(() => {
          message.success('Мероприятие удалено', 3);
          this.history.push('/actions');
        })
        .catch((error) => {
          message.error(http.parseError('Не удалось удалить мероприятие', error), 5);
        })
      ),
    });
  }

  addUserToAction() {
    this.addRemoveUserToActionLoading.value = true;
    http.post('/action/users', undefined, {
      params: {
        userId: store.userId,
        actionId: this.action.id,
      },
    })
    .then(() => {
      message.success('Вы добавлены к мероприятию', 3);
      runInAction(() => {
        this.action.users.push(store.UserData.userData);
        this.action = { ...this.action };
      });
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось добавить вас к мероприятию', error), 5);
    })
    .finally(this.addRemoveUserToActionLoading.setFalse);
  }

  removeUserFromAction() {
    this.addRemoveUserToActionLoading.value = true;
    http.post('/action/users/delete', undefined, {
      params: {
        userId: store.userId,
        actionId: this.action.id,
      },
    })
    .then(() => {
      message.success('Вы убраны с мероприятия', 3);
      runInAction(() => {
        this.action.users.splice(this.action.users.findIndex((user) => user.id === store.userId), 1);
        this.action = { ...this.action };
      });
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось убрать вас с мероприятия', error), 5);
    })
    .finally(this.addRemoveUserToActionLoading.setFalse);
  }
}

function ActionView() {
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
  useOnce(state.getAction);

  return (
    <>
      <div className="mb-3 d-flex justify-content-between">
        <Button onClick={state.toActionsList}>
          К списку мероприятий
        </Button>
        {state.editDeleteButtons}
      </div>
      <Skeleton
        active
        loading={state.loading.value}
      >
        <h2 className="px-4">
          {state.action.title}
        </h2>
        <Divider className="mt-3 mb-2" />
        <div>
          <TeamOutlined />
          {state.countUsersInAction}
          <Divider type="vertical" />
          {state.inviteUninviteToActionComponent}
        </div>
        <Divider className="mt-2 mb-3" />
        <div
          className="p-3 border text-light-5-bg max-width-100-inners"
          dangerouslySetInnerHTML={state.parsedActionDescription}
        />
      </Skeleton>
    </>
  );
}
export default observer(ActionView);
