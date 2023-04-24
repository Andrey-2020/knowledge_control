import React, {
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  useParams,
  useHistory,
} from 'react-router-dom';
import {
  Layout,
  Menu,
  Spin,
  Tooltip,
} from 'antd';
import { Helmet } from 'react-helmet';
import { RollbackOutlined } from '@ant-design/icons';
import classnames from 'classnames';

import useOnce from 'utils/useOnce';
import useSelector from 'utils/useSelector';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import http from 'plugins/http';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import TaskView from 'pages/Tasks/TaskList/ForUser/TaskView';
import classes from 'pages/Tasks/TaskList/ForUser/index.module.css';

/**
 * Просмотр Заданий по предмету
 */
export default function Index() {
  const history = useHistory();
  const { subjectId } = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(subjectId))) {
    history.push('/subjects');
    return null;
  }
  const [componentUid] = useCancelableRequests('Tasks/TaskList/ForUser/Index');

  /**
   * @type {[
   *   import('DBModels').Task[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').Task[]>>
   * ]}
   */
  const [taskList, setTaskList] = useState([]);
  const taskSelector = useSelector(taskList, 'id');
  const [taskListLoading, setTaskListLoading] = useState(true);
  useOnce(() => {
    http.get('/task/teaching', {
      params: { subjectId },
      forCancel: { componentUid },
    })
    .then((response) => {
      setTaskList(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить список заданий', error), 5);
    }))
    .finally(() => {
      setTaskListLoading(false);
    });
  });

  const TaskListMenuItems = useMemo(() => (taskList.map(({ id, title }) => (
    <Menu.Item
      key={id}
      className={classnames('pt-1 text-wrap', classes['menu-item'])}
      style={{
        height: 'unset',
      }}
    >
      <img
        className="mr-1"
        width="40px"
        alt="Логотип задания"
        src={`${process.env.PUBLIC_URL}/img/photo/testIcon.png`}
      />
      <Tooltip
        className="overflow-hidden text-overflow-ellipsis"
        title={title}
      >
        {title}
      </Tooltip>
    </Menu.Item>
  ))), [taskList]);

  /**
   * @type {[
   *   import('DBModels').Task,
   *   React.Dispatch<React.SetStateAction<import('DBModels').Task>>,
   * ]}
   */
  const [selectedTask, setSelectedTask] = useState(null);
  const select = useCallback(({ key: taskId }) => {
    setSelectedTask(taskSelector[taskId]);
  }, [taskSelector]);

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
            spinning={taskListLoading}
          >
            <Menu onSelect={select}>
              <Menu.Item
                key="toSubjects"
                className={classes['to-subjects-menu-item']}
                onClick={() => { history.push('/subjects'); }}
              >
                <div className="d-flex align-items-center">
                  <RollbackOutlined/>
                  К списку предметов
                </div>
              </Menu.Item>
              {TaskListMenuItems}
            </Menu>
          </Spin>
        </Layout.Sider>
        <Layout className="p-4">
          {selectedTask && (
            <TaskView
              key={selectedTask.id}
              {...selectedTask}
            />
          )}
        </Layout>
      </Layout>
    </>
  );
}