import React, {
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  AutoComplete,
  Form,
  Select,
  Row,
  message,
  Divider,
  Spin,
} from 'antd';
import { Helmet } from 'react-helmet';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { when } from 'mobx';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import useOnce from 'utils/useOnce';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';
import http from 'plugins/http';
import store from 'globalStore';
import { ROLES } from 'globalStore/constants';
import Table, { createEmptyScheduleTable } from 'pages/Schedule/ScheduleTable';

/**
 * Функция указывает, входит ли поисковое значение в строковую опцию
 * 
 * @param {string} inputValue
 * @param {{ value: string }} option
 * @returns {boolean}
 */
function noCaseFilter(inputValue, option) {
  return option.value.toLowerCase().includes(inputValue.toLowerCase());
}

/**
 * Страницы расписания
 */
function Schedule() {
  const [componentUid] = useCancelableRequests('Schedule/Schedule');
  const { t } = useTranslation('pages.Schedule.Schedule', { useSuspense: false });

  /** Перевод доступных типов для поиска расписания - по учителю или по группе */
  const searchByTranslation = useMemo(() => ({
    'groups': t('searchByTranslation--groups'),
    'teachers': t('searchByTranslation--teachers'),
  }), [t]);

  /**
   * @type {[
   *   string[],
   *   React.Dispatch<React.SetStateAction<string[]>>,
   * ]}
   */
  const [nameGroups, setNameGroups] = useState([]);
  const nameGroupsOptions = useMemo(() => {
    return nameGroups.map((nameGroup) => ({
      value: nameGroup,
      label: nameGroup,
    }));
  }, [nameGroups]);
  /**
   * @type {[
   *   string[],
   *   React.Dispatch<React.SetStateAction<string[]>>,
   * ]}
   */
  const [teachers, setTeachers] = useState([]);
  const teachersOptions = useMemo(() => {
    return teachers.map((teacher) => ({
      value: teacher,
      label: teacher,
    }));
  }, [teachers]);

  const [week, setWeek] = useState(0);
  /**
   * @type {[
   *   import('DBModels').Schedule,
   *   React.Dispatch<React.SetStateAction<import('DBModels').Schedule>>,
   * ]}
   */
  const [scheduleTable, setScheduleTable] = useState(null);
  const changeScheduleTable = useCallback(
    /**
     * Задание таблицы расписания по дням
     * 
     * @param {{}[][]} days
     */
    (days) => {
      const newScheduleTable = createEmptyScheduleTable();
      for (const day of days) {
        const dayIndex = (day.numberWeek - 1) * 7 + (day.number_day - 1);
        for (const pair of day.coupels) {
          newScheduleTable[dayIndex][pair.pair_number - 1] = pair;
        }
      }
      setScheduleTable(newScheduleTable);
    },
    [],
  );

  /**
   * @type {[
   *   string,
   *   React.Dispatch<React.SetStateAction<string>>,
   * ]}
   */
  const [selectedScheduleObject, setSelectedScheduleObject] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);

  const searchGroupSchedule = useCallback(
    /**
     * Ищет расписание по названию группы
     *
     * @param {string} nameGroup
     */
    (nameGroup) => {
      if (!nameGroup) {
        return;
      }
      setSelectedScheduleObject(nameGroup);
      setLoadingTable(true);
      http.get('/schedule', {
        params: { nameGroup },
        forCancel: { componentUid },
      })
      .then((response) => {
        changeScheduleTable(response.data.days);
      })
      .catch(http.ifNotCancel((error) => {
        createDecoratedErrorMessage(http.parseError(
          t('searchGroupSchedule--error'), error), 5);
        setScheduleTable(null);
      }))
      .finally(() => {
        setLoadingTable(false);
      });
    },
    [changeScheduleTable, componentUid, t],
  );

  const searchTeacherSchedule = useCallback(
    /**
     * Ищет группу по имени преподавателя
     *
     * @param {{ nameTeacher: string }}
     */
    (nameTeacher) => {
      if (!nameTeacher) {
        return;
      }
      setSelectedScheduleObject(nameTeacher);
      setLoadingTable(true);
      http.get('/teacher', {
        params: { nameTeacher },
        forCancel: { componentUid },
      })
      .then((response) => {
        changeScheduleTable(response.data.days);
      })
      .catch(http.ifNotCancel((error) => {
        createDecoratedErrorMessage(http.parseError(
          t('searchTeacherSchedule--error'), error), 5);
        setScheduleTable(null);
      }))
      .finally(() => {
        setLoadingTable(false);
      });
    },
    [changeScheduleTable, componentUid, t],
  );

  useOnce(() => {
    http.get('/schedule/list', { forCancel: { componentUid } })
    .then((response) => {
      setNameGroups(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        t('useOnce--get-schedule-list--error'), error), 5);
    }));

    http.get('/teacher/list', { forCancel: { componentUid } })
    .then((response) => {
      setTeachers(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        t('useOnce-get-teacher-list--error'), error), 5);
    }));
  });

  /**
   * Этот кусок написан с логическими ошибками и должен быть переписан.
   * searchTeacherSchedule и searchGroupSchedule могут измениться во время рендера,
   * тогда ничего не сработает
   */
  useOnceWithRevoke(() => when(
    () => Boolean(store.UserData.id),
    () => {
      if (store.userRole === ROLES.TEACHER) {
        searchTeacherSchedule(
          `${store.UserData.lastName} ${store.UserData.firstName[0]} ${store.UserData.patronymic[0]}`
        );
      } else if (store.UserData.studyGroupId) {
        setLoadingTable(true);
        http.get('/study-group/search-by-ids', { params: { id: [store.UserData.studyGroupId] } })
        .then((response) => {
          searchGroupSchedule(response.data[0].shortName);
        })
        .catch(http.ifNotCancel((error) => {
          setLoadingTable(false);
          message.error(http.parseError(
            i18n.t('pages.Schedule.Schedule:useEffect--get-studyGroup-by-ids'), error), 5);
        }));
      }
    },
  ));

  const [searchBy, setSearchBy] = useState(
    store.userRole !== ROLES.TEACHER ?
    'groups' :
    'teachers'
  );
  const searchForm = useMemo(() => {
    if (searchBy === 'groups') {
      return (
        <Form.Item label={t('template.searchForm--groups--label')}>
          <AutoComplete
            key="groups-autocomplete"
            allowClear
            style={{ width: '200px' }}
            options={nameGroupsOptions}
            filterOption={noCaseFilter}
            onSelect={searchGroupSchedule}
          />
        </Form.Item>
      );
    }
    return (
      <Form.Item label={t('template.searchForm--teachers--label')}>
        <AutoComplete
          key="teachers-autocomplete"
          allowClear
          style={{ width: '200px' }}
          options={teachersOptions}
          filterOption={noCaseFilter}
          onSelect={searchTeacherSchedule}
        />
      </Form.Item>
    );
  }, [
    searchBy,
    searchGroupSchedule,
    searchTeacherSchedule,
    nameGroupsOptions,
    teachersOptions,
    t,
  ]);

  const selectedScheduleObjectText = useMemo(() => {
    if (!selectedScheduleObject) {
      return null;
    }
    return (
      <h6>
        <span className="mr-2">
          {searchByTranslation[searchBy]}:
        </span>
        {selectedScheduleObject}
      </h6>
    );
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [selectedScheduleObject, searchByTranslation]);

  return (
    <>
      <Helmet>
        <title>
          {t('template.title')}
        </title>
      </Helmet>
      <Row>
        <Form.Item label={t('template.searchBy--label')}>
          <Select
            style={{ width: '175px' }}
            value={searchBy}
            onChange={setSearchBy}
          >
            <Select.Option value="groups">
              {t('template.searchBy--groups--text')}
            </Select.Option>
            <Select.Option value="teachers">
              {t('template.searchBy--teachers--text')}
            </Select.Option>
          </Select>
        </Form.Item>
        <Divider
          style={{ height: '32px' }}
          type="vertical"
        />
        {searchForm}
        <div>
          <Select
            defaultValue={0}
            onChange={setWeek}
          >
            <Select.Option value={0}>
              {t('template.week--1--text')}
            </Select.Option>
            <Select.Option value={1}>
              {t('template.week--2--text')}
            </Select.Option>
          </Select>
        </div>
      </Row>
      {selectedScheduleObjectText}
      <Spin
        tip={t('template.Spin--tip')}
        spinning={loadingTable}
      >
        <Table
          table={scheduleTable}
          week={week}
        />
      </Spin>
    </>
  );
}
export default observer(Schedule);
