import React, {
  useState,
  useMemo,
} from 'react';
import { Tabs } from 'antd';
import { Helmet } from 'react-helmet';
import zipObject from 'lodash/zipObject';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import Users from 'pages/Administration/Users';
import StudyGroups from 'pages/Administration/StudyGroups';
// import SubjectSemesters from 'pages/Administration/SubjectSemesters';
import Subjects from 'pages/Administration/Subjects';
import Departments from 'pages/Administration/Departments';
import Faculties from 'pages/Administration/Faculties';

function i18nTabNameFunction(key) {
  return () => i18n.t(`pages.Administration.index:tabNames.${key}`);
}

/**
 * @type {{
 *   key: string,
 *   tabName: () => string,
 *   TabComponent: () => JSX.Element,
 * }[]}
 */
const tabs = [
  {
    key: 'users',
    tabName: i18nTabNameFunction('Users'),
    TabComponent: Users,
  },
  {
    key: 'studyGroups',
    tabName: i18nTabNameFunction('StudyGroups'),
    TabComponent: StudyGroups,
  },
  // Много фиксов
  // {
  //   key: 'semesters',
  //   tabName: i18nTabNameFunction('SubjectSemesters'),
  //   TabComponent: SubjectSemesters,
  // },
  {
    key: 'subjects',
    tabName: i18nTabNameFunction('Subjects'),
    TabComponent: Subjects,
  },
  {
    key: 'departments',
    tabName: i18nTabNameFunction('Departments'),
    TabComponent: Departments,
  },
  {
    key: 'faculties',
    tabName: i18nTabNameFunction('Faculties'),
    TabComponent: Faculties,
  },
];
const tabsTranslation = zipObject(
  tabs.map(({ key }) => key),
  tabs.map(({ tabName }) => tabName),
);

/**
 * Табы с изменением разных данных.
 * Доступно только администраторам
 */
export default function Index() {
  const { t } = useTranslation(
    'pages.Administration.index',
    { useSuspense: false },
  );
  
  const [activeTab, setActiveTab] = useState('users');

  const title_ = useMemo(() => (
    <title>
      {t('title')}:
      {tabsTranslation[activeTab]()}
    </title>
  ), [activeTab, t]);

  const tabsComponent = useMemo(() => (
    tabs.map(({ key, tabName, TabComponent }) => (
      <Tabs.TabPane
        key={key}
        tab={tabName()}
      >
        <TabComponent/>
      </Tabs.TabPane>
    ))
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  ), [t]);

  return (
    <>
      <Helmet>
        {title_}
      </Helmet>
      <Tabs
        className="px-3 h-100 text-light-5-bg"
        onChange={setActiveTab}
      >
        {tabsComponent}
      </Tabs>
    </>
  );
}
