import React, { useState } from 'react';
import {
  useHistory,
  useLocation,
} from 'react-router-dom';
import {
  Layout,
  Menu,
  AutoComplete,
  Avatar,
  Tooltip,
  Modal,
  Divider,
  Button,
  message,
} from 'antd';
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  DesktopOutlined,
  MailOutlined,
  FireOutlined,
} from '@ant-design/icons';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import i18n from 'i18next';

import { BooleanState } from 'plugins/mobx/fields';
import store from 'globalStore';
import {
  ROLES,
  roleTranslator,
  AUTHORIZATION_STATE,
} from 'globalStore/constants';
import { withPageWrapper } from 'pages/routes';
import ChartBox from 'components/icons/ChartBox';
import Calendar from 'components/icons/Calendar';
import Messages from 'components/icons/Messages';
import QuestionOutlined from 'components/icons/QuestionOutlined';
import Logout from 'components/icons/Logout';
import Profile from 'components/icons/Profile';
import SmallUserSettings from 'pages/_WrapperMenu/SmallUserSettings';
import BaseState from 'plugins/mobx/BaseState';
import 'pages/_WrapperMenu/index.scss';


/**
 * Создаётся всёго один экземпляр компонента, поэтому можно хранить иконки так
 *
 * @type {{
 *   [pageTitle: string]: () => JSX.Element,
 * }}
 */
const pageMenuIcons = {
  '/main': ChartBox,
  '/schedule': Calendar,
  '/subjects': Messages,
  '/administration': DesktopOutlined,
  '/profile' : Profile,
  '/actions': FireOutlined,
};

/**
 * Создаётся всёго один экземпляр компонента, поэтому можно хранить элементы меню так
 *
 * @type {import('.').PageMenuItem[]}
 */
const allPageMenuItems = withPageWrapper.map(
  ({ path, title, authorization, access }) => ({
    path,
    title,
    authorization,
    access,
    // Если вдруг нет иконки, то отобразится ExclamationCircleOutlined
    icon: React.createElement(pageMenuIcons[path] || ExclamationCircleOutlined)
  })
);

/**
 * Создаётся всёго один экземпляр компонента, поэтому можно хранить элементы меню так
 */
/** @type {import('.').PageMenuItem[]} */
const userPageMenuItems = [];
/** @type {import('.').PageMenuItem[]} */
const teacherPageMenuItems = [];
/** @type {import('.').PageMenuItem[]} */
const adminPageMenuItems = [];
/** @type {import('.').PageMenuItem[]} */
const unauthPageMenuItems = [];

for (const menuItem of allPageMenuItems) {
  if (menuItem.access.includes(ROLES.USER)) {
    userPageMenuItems.push(menuItem);
  }
  if (menuItem.access.includes(ROLES.TEACHER)) {
    teacherPageMenuItems.push(menuItem);
  }
  if (menuItem.access.includes(ROLES.ADMIN)) {
    adminPageMenuItems.push(menuItem);
  }

  if (menuItem.authorization === AUTHORIZATION_STATE.BOTH) {
    unauthPageMenuItems.push(menuItem);
  }
}

/** @extends {BaseState<undefined>} */
class State extends BaseState {
  activeMenuItem = {
    pathname: '',
    menuItem: [''],
  };
  menuCollapsed = new BooleanState(true);

  constructor() {
    super();
    makeObservable(this, {
      activeMenuItem: observable,
      pageMenuItems: computed,
      pageMenuItemsComponent: computed,
      fullName: computed,
      logOutComponent: computed,
      recalcActiveMenuItem: action,
      setHistoryAndLocation: action,
      toProfilePage: action.bound,
      showContacts: action.bound,
      confirmLogout: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get pageMenuItems() {
    if (store.userRole) {
      if (store.userRole === ROLES.TEACHER) {
        return teacherPageMenuItems;
      }
      if (store.userRole === ROLES.ADMIN) {
        return adminPageMenuItems;
      }
      // store.userRole === ROLES.USER || ХЗ, шо за роль
      return userPageMenuItems;
    }
    return unauthPageMenuItems;
  }

  get pageMenuItemsComponent() {
    return this.pageMenuItems.map(({ path, icon, title }) => (
      <Menu.Item
        key={path}
        icon={icon}
        onClick={() => { this.history.push(path); }}
      >
        {title()}
      </Menu.Item>
    ));
  }

  get fullName() {
    const result = [];
    if (store.UserData.lastName) {
      result.push(store.UserData.lastName);
    }
    if (store.UserData.firstName) {
      result.push(store.UserData.firstName);
    }
    if (store.UserData.patronymic) {
      result.push(store.UserData.patronymic);
    }
    return result.join(' ') || i18n.t('pages._WrapperMenu.index:fullName--incognita');
  }

  get logOutComponent() {
    return store.isAuthorized ? (
      <Tooltip
        placement="bottom"
        title={i18n.t('pages._WrapperMenu.index:template.Tooltip--title')}
      >
        <Logout
          className="flex-grow-0 text-light-2-text"
          style={{ fontSize: '24px' }}
          onClick={this.confirmLogout}
        />
      </Tooltip>
    ) : (
      <Button
        className="linear-gradient-button"
        size="large"
        onClick={() => { this.history.push('/login'); }}
      >
        {i18n.t('pages._WrapperMenu.index:template.login-button--text')}
      </Button>
    );
  }
  
  recalcActiveMenuItem() {
    this.activeMenuItem.pathname = this.history.location.pathname;
    this.activeMenuItem.menuItem = [`/${this.activeMenuItem.pathname.split('/', 2)[1]}`];
  }

  /**
   * @param {import('history').History} history
   * @param {import('history').Location} location
   */
  setHistoryAndLocation(history, location) {
    this.history = history;
    if (location.pathname !== this.activeMenuItem.pathname) {
      this.recalcActiveMenuItem();
    }
  }

  toProfilePage() {
    if (store.userRole) {
      this.history.push('/profile');
    }
  }

  showContacts() {
    Modal.info({
      width: '450px',
      title: 'Контакты для обратной связи',
      content: (
        <>
          <h5>
            Если возникли вопросы
          </h5>
          <small>(или не дай бог вы нашли баги)</small>
          <div>
            Писать сюда:
            <Button
              type="link"
              onClick={() => {
                clipboardCopy('damir_saitov1985@mail.ru')
                .then(() => {
                  message.success('Адрес скопирован');
                });
              }}
            >
              <MailOutlined/>
              damir_saitov1985@mail.ru
            </Button>
          </div>
        </>
      ),
    });
  }

  /** Выводит модальное окно требующее подтверждение выхода */
  confirmLogout() {
    Modal.confirm({
      maskClosable: true,
      title: i18n.t('pages._WrapperMenu.index:confirmLogout.title'),
      icon: <ExclamationCircleOutlined/>,
      okText: i18n.t('pages._WrapperMenu.index:confirmLogout.okText'),
      cancelText: i18n.t('pages._WrapperMenu.index:confirmLogout.cancelText'),
      onOk: () => {
        store.logOut();
        this.history.push('/login');
      },
    });
  }
}

/**
 * Компонент, который оборачивает стрницы в меню
 *
 * @param {{ children: JSX.Element }} props
 */
function WrapperMenu(props) {
  const history = useHistory();
  /*
    Есть в history,
    но необходим rerender,
    вызываемые изменением location,
    чтобы выставить activeMenuItem
  */
  const location = useLocation();
  const { t } = useTranslation('pages._WrapperMenu.index', { useSuspense: false });

  const state = useState(State.create)[0];
  state.setHistoryAndLocation(history, location);

  return (
    <Layout className="page">
      <Layout.Sider
        className="side-menu"
        width="300px"
        trigger={null}
        collapsed={state.menuCollapsed.value}
        onMouseEnter={state.menuCollapsed.setFalse}
        onMouseLeave={state.menuCollapsed.setTrue}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={state.activeMenuItem.menuItem}
        >
          <Menu.Item
            key="ulstu"
            className="my-0 px-2 py-3"
            style={{
              background: 'linear-gradient(237deg, var(--primary-light-2) 8%, var(--primary-dark-1) 95%)',
              height: '82px',
            }}
            icon={
              <img
                width="62px"
                height="47px"
                style={{ minWidth: '62px', maxWidth: '62px' }}
                color="text-light-5-bg"
                alt="Ulstu"
                src={process.env.PUBLIC_URL + '/img/logo.png'}
              />
            }
            onClick={() => { this.history.push('/main'); }}
          >
            <span className="text">
              <b>Learn.</b>Ulstu
            </span>
          </Menu.Item>
          {state.pageMenuItemsComponent}
        </Menu>
        <div
          className="mt-auto"
          style={{ padding: '23px 29px' }}
        >
          <QuestionOutlined onClick={state.showContacts}/>
        </div>
      </Layout.Sider>
      <Layout>
        <Layout.Header className="d-flex align-items-center header">
          <div
            className="pr-5 flex-grow-1"
            style={{ flexBasis: '100px' }}
          >
            <SearchOutlined
              className="text-light-2-text"
              style={{
                verticalAlign: 'middle',
                fontSize: '16px',
              }}
            />
            <AutoComplete
              className="autocomplete"
              placeholder={t('template.AutoComplete--placeholder')}
            />
          </div>
          <div
            className={classnames(
              'd-flex flex-grow-0 align-items-center', {
                'cursor-pointer': store.userRole,
            })}
            onClick={state.toProfilePage}
          >
            <div
              className="d-inline-block pr-2"
              style={{ fontSize: '16px' }}
            >
              <b>{state.fullName}</b>
              <br/>
              <small>
                {store.userRole && roleTranslator(store.userRole)}
              </small>
            </div>
            <Avatar
              size={52}
              alt={t('template.Avatar-alt')}
              src={store.UserData.avatarUrl || `${process.env.PUBLIC_URL}/img/photo/Default.png`}
            />
          </div>
          <Divider
            className="h-75"
            type="vertical"
          />
          <SmallUserSettings/>
          <Divider
            className="h-75"
            type="vertical"
          />
          {state.logOutComponent}
        </Layout.Header>
        <Layout.Content className="p-4">
          {props.children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
export default observer(WrapperMenu);
