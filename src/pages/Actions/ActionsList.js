import React, { useState } from 'react';
import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import {
  Tag,
  message,
  Spin,
  Space,
  List,
  Divider,
  Button,
  Modal,
} from 'antd';
import classnames from 'classnames';
import { TeamOutlined } from '@ant-design/icons';

import BaseState from 'plugins/mobx/BaseState';
import { BooleanState } from 'plugins/mobx/fields';
import http from 'plugins/http';
import useOnce from 'utils/useOnce';
import store from 'globalStore';
import { ROLES } from 'globalStore/constants';
import eventStop from 'utils/eventStop';


/**
 * @param {string} text
 * @returns {string}
 */
function getColorByText(text) {
  const firstLetter = text[0],
    thirdLetter = text.charAt(2) || '0';
  
  const firstLetterCharCode = firstLetter.charCodeAt(0),
    thirdLetterCharCode = thirdLetter.charCodeAt(0);

  const firstLetterHex = (firstLetterCharCode * thirdLetterCharCode).toString(16).padStart(3, '9').slice(-3),
    thirdLetterHex = (firstLetterCharCode ^ thirdLetterCharCode).toString(16).padStart(3, '9').slice(-3);

  return `#${firstLetterHex[0]}${thirdLetterHex[2]}${firstLetterHex[1]}${thirdLetterHex[1]}${firstLetterHex[2]}${thirdLetterHex[0]}`;
}

/** @extends {BaseState<undefined>} */
class State extends BaseState {
  /** @type {import('DBModels').ActionType[]} */
  actionTypes = [];
  loadingActionTypes = new BooleanState(true);

  /** @type {Set<import('DBModels').ActionType['id']>} */
  unselectedActionTypes = new Set();

  /** @type {import('DBModels').Action[]}*/
  actions = [];
  loadingActions = new BooleanState(true);

  constructor() {
    super();
    makeObservable(this, {
      actionTypes: observable.shallow,
      unselectedActionTypes: observable.shallow,
      actions: observable.shallow,
      loading: computed,
      actionsHideUnselectedActionTypes: computed,
      addActionButtonComponent: computed,
      actionTypesComponents: computed,
      getActionTypes: action.bound,
      getActions: action.bound,
      renderActionsListItem: action.bound,
      deleteAction: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get loading() {
    return this.loadingActionTypes.value ||
      this.loadingActions.value;
  }

  get actionsHideUnselectedActionTypes() {
    return this.actions.filter((action) => !this.unselectedActionTypes.has(action.actionType.id));
  }

  get addActionButtonComponent() {
    if (store.userRole !== ROLES.ADMIN) {
      return null;
    }
    return (
      <Button
        type="primary"
        onClick={() => { this.history.push('/actions/add'); }}
      >
        Добавить мероприятие
      </Button>
    );
  }

  get actionTypesComponents() {
    return this.actionTypes.map((actionType) => {
      const unselected = this.unselectedActionTypes.has(actionType.id);
      return (
        <Tag
          key={actionType.id}
          className={classnames('cursor-pointer', {
            'text-line-through': unselected,
            'font-weight-bold': !unselected,
          })}
          color={getColorByText(actionType.type)}
          onClick={() => {
            if (unselected) {
              this.unselectedActionTypes.delete(actionType.id);
            } else {
              runInAction(() => {
                this.unselectedActionTypes.add(actionType.id);
              });
            }
          }}
        >
          {actionType.type}
        </Tag>
      );
    });
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

  getActions() {
    this.loadingActions.value = true;
    http.get('/action/all')
    .then((response) => {
      runInAction(() => {
        this.actions = response.data;
      });
    })
    .catch((error) => {
      message.error(http.parseError('Не удалось получить мероприятия', error), 5);
    })
    .finally(this.loadingActions.setFalse);
  }

  /** @param {import('DBModels').Action} action */
  renderActionsListItem(action) {
    const listItemActions = [(
      <>
        <TeamOutlined />
        {action.users.length}
      </>
    )];

    if (store.userRole === ROLES.ADMIN) {
      listItemActions.push((
        <Button
          size="small"
          type="primary"
          onClick={eventStop(() => { this.history.push(`/actions/${action.id}/edit`); })}
        >
          Изменить мероприятие
        </Button>
      ), (
        <Button
          size="small"
          type="danger"
          onClick={eventStop(() => { this.deleteAction(action); })}
        >
          Удалить мероприятие
        </Button>
      ));
    }

    return (
      <List.Item
        key={action.id}
        className="cursor-pointer primary-light-3-bg"
        extra={(
          <>
            <Tag color={getColorByText(action.actionType.type)}>
              {action.actionType.type}
            </Tag>
            <b>{`${action.actionDate[2]}.${action.actionDate[1]}.${action.actionDate[0]}`}</b>
          </>
        )}
        actions={listItemActions}
        onClick={() => { this.history.push(`/actions/${action.id}`); }}
      >
        <List.Item.Meta title={action.title} />
      </List.Item>
    );
  }

  /** @param {import('DBModels').Action} action */
  deleteAction(action) {
    Modal.confirm({
      title: 'Удаление мероприятия',
      content: `Вы действительно хотите удалить мероприятие "${action.title}"?`,
      okText: 'Удалить',
      cancelText: 'Нет',
      onOk: () => (
        http.delete('/action', { params: { id: action.id } })
        .then(() => {
          message.success('Мероприятие удалено', 3);
          this.getActions();
        })
        .catch((error) => {
          message.error(http.parseError('Не удалось удалить мероприятие', error), 5);
        })
      ),
    });
  }
}


function ActionsList() {
  const history = useHistory();
  const state = useState(State.create)[0];
  state.history = history;

  useOnce(state.getActionTypes);
  useOnce(state.getActions);

  return (
    <Spin spinning={state.loading}>
      <p className="text-right">
        {state.addActionButtonComponent}
      </p>
      <Space
        className="overflow-auto pb-2"
        style={{ maxWidth: '100%' }}
      >
        {state.actionTypesComponents}
      </Space>
      <Divider className="mt-2" />
      <List
        className="overflow-auto"
        style={{ maxHeight: 'calc(100vh - 82px - 48px - 45px - 28px - 40px)' }}
        bordered
        rowKey="id"
        itemLayout="vertical"
        dataSource={state.actionsHideUnselectedActionTypes}
        renderItem={state.renderActionsListItem}
      />
    </Spin>
  );
}
export default observer(ActionsList);
