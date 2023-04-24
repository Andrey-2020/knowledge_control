import React from 'react';
import {
  Tabs,
} from 'antd';
import { observer } from 'mobx-react';

import store from 'globalStore';
import { ROLES } from 'globalStore/constants';
import SubjectList from 'pages/Subjects/SubjectList';
import GroupTable from 'pages/Subjects/TEACHER/GroupTable';
import UserAttendanceJournal from 'pages/Subjects/USER/AttendanceJournal';
import TeacherAttendanceJournal from 'pages/Subjects/TEACHER/AttendanceJournal';


function TabsSubjectActivity() {
  return (
    <Tabs>
      <Tabs.TabPane
        key="Список предметов"
        tab="Список предметов"
      >
        <SubjectList />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="Посещаемость"
        tab="Посещаемость"
      >
        {store.userRole === ROLES.USER ?
          <UserAttendanceJournal /> : <TeacherAttendanceJournal />}
      </Tabs.TabPane>
      {store.userRole === ROLES.TEACHER && (
        <Tabs.TabPane
          key="Журнал оценок"
          tab="Журнал оценок"
        >
          <GroupTable />
        </Tabs.TabPane>
      )}
    </Tabs>
  );
}
export default observer(TabsSubjectActivity);
