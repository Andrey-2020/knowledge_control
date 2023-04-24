import React, {
  useState,
  useCallback,
  lazy,
} from 'react';
import {
  Route,
  useParams,
  useHistory,
} from 'react-router-dom';
import {
  Layout,
  Menu,
  Spin,
  message,
} from 'antd';
import { Helmet } from 'react-helmet';
import {
  RollbackOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react';

import eventStop from 'utils/eventStop';
import useOnce from 'utils/useOnce';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import http from 'plugins/http';
import store from 'globalStore';
import { useEventBusListener } from 'plugins/eventBus';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import SuspenseSwitch from 'plugins/router/SuspenseSwitch';
const AddTaskPage = lazy(() => import('pages/Tasks/TaskList/ForTeacher/AddTaskPage'));
const ChangeTaskPage = lazy(() => import('pages/Tasks/TaskList/ForTeacher/ChangeTaskPage'));

/**
 * Просмотр групп и заданий по ним,
 * а также переход на добавление, редактирование и удаление заданий
 */
function Index() {
  const history = useHistory();
  const { subjectId } = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(subjectId))) {
    history.push('/subjects');
    return null;
  }
  const [componentUid] = useCancelableRequests('Tasks/TaskList/ForTeacher/Index');
  
  /**
   * @type {[
   *   import('.').TasksByStudyGroups,
   *   React.Dispatch<React.SetStateAction<import('.').TasksByStudyGroups>>,
   * ]}
   */
  const [tasksByStudyGroups, setTasksByStudyGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const getTasks = useCallback(() => {
    Promise.allSettled([
      http.get('/task/teaching', {
        params: { subjectId },
        forCancel: { componentUid },
      })
        .then((response) => {
          const result = {};
          for (const task of response.data) {
            const semesterId = task.semesterIds[0];
            if (semesterId in result) {
              result[semesterId].push(task);
            } else {
              result[semesterId] = [task];
            }
          }
          setTasksByStudyGroups(result);
        })
        .catch(http.ifNotCancel((error) => {
          createDecoratedErrorMessage(http.parseError(
            'Не удалось получить список заданий', error), 5);
        })),

      // Получение групп у которых есть этот предмет
      http.get('/study-group/learning', {
        params: { subjectId },
        forCancel: { componentUid },
      })
        .then((response) => {
          store.studyGroupsData.setStudyGroups(response.data);
          // Получение семестров для получения заданий
          return http.get('/subject-semester', {
            params: {
              subjectId,
              groupId: response.data.map(({ id }) => id),
            },
            forCancel: { componentUid },
          });
        })
        .then((response) => {
          store.studyGroupsData.connectSemestersAndStudyGroups(response.data);
        })
        .catch(http.ifNotCancel((error) => {
          createDecoratedErrorMessage(http.parseError(
            'Не удалось получить список предметов', error), 5);
        })),
    ])
    .finally(() => {
      setLoading(false);
    });
  }, [componentUid, subjectId]);
  useOnce(getTasks);

  useEventBusListener('Tasks/TaskList/ForTeacher/AddTaskForm:add', getTasks);

  const select = useCallback(({ key }) => {
    if (key === 'toSubjects') {
      history.push('/subjects');
    } else if (key === 'add') {
      history.push(`/subjects/${subjectId}/tasks/add`);
    } else {
      history.push(`/subjects/${subjectId}/tasks/${key.split('/')[1]}`);
    }
  }, [history, subjectId]);

  const deleteTask = useCallback((id) => {
    setLoading(true);
    http.delete('/task', { data: [id] })
    .then(() => {
      message.success('Задание успешно удалено (теперь студентики будут меньше страдать)', 3);
      getTasks();
    })
    .catch((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось удалить задание', error), 5);
    })
    .finally(() => {
      setLoading(false);
    })
  }, [getTasks]);

  return (
    <>
      <Helmet>
        <title>Лабы - чтобы побиться лбами</title>
      </Helmet>
      <Layout
        className="m-n4"
        style={{ height: 'calc(100% + 48px)' }}
      >
        <Layout.Sider
          width="300px"
          theme="light"
        >
          <Spin
            size="large"
            spinning={loading}
          >
            <Menu
              mode="inline"
              onSelect={select}
            >
              <Menu.Item
                key="toSubjects"
                className="d-flex align-items-center"
              >
                <RollbackOutlined/>
                К списку предметов
              </Menu.Item>
              {store.studyGroupsData.studyGroups.map(({ id, shortName }) => (
                <Menu.SubMenu
                  key={id}
                  title={shortName}
                >
                  {tasksByStudyGroups?.[
                    store.studyGroupsData.studyGroupSemesterRef.studyGroupToSemester?.[id]
                  ]?.map(({ id: id_, title }) => (
                      <Menu.Item
                        key={`${id}/${id_}`}
                        className="d-flex align-items-center justify-content-between text-wrap pb-1"
                        style={{
                          height: 'unset',
                          lineHeight: '32px',
                        }}
                      >
                        {title}
                        <CloseCircleOutlined
                          className="ml-2"
                          onClick={eventStop(() => { deleteTask(id_); })}
                        />
                      </Menu.Item>
                    ))
                  }
                </Menu.SubMenu>
              ))}
              <Menu.Item
                key="add"
                className="d-flex align-items-center"
              >
                <PlusOutlined/>
                Добавить задание
              </Menu.Item>
            </Menu>
          </Spin>
        </Layout.Sider>
        <Layout className="p-4">
          <SuspenseSwitch>
            {/* Добавление задания */}
            <Route
              exact
              path="/subjects/:subjectId/tasks/add"
              component={AddTaskPage}
            />
            {/* Просмотр и редактирование задания */}
            <Route
              exact
              path="/subjects/:subjectId/tasks/:taskId"
              component={ChangeTaskPage}
            />
          </SuspenseSwitch>
        </Layout>
      </Layout>
    </>
  );
}

export default observer(Index);
