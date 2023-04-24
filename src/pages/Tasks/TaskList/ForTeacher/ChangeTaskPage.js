import React, {
  useEffect,
  useState,
} from 'react';
import {
  Divider,
  Spin,
  message,
} from 'antd';
import {
  useParams,
  useHistory,
} from 'react-router-dom';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import http from 'plugins/http';
import FilesView from 'components/FilesView';

/**
 * Форма изменения и просмотра задания
 */
export default function ChangeTaskPage() {
  const { subjectId, taskId } = useParams();
  const history = useHistory();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(subjectId))) {
    history.push('/subjects');
    return null;
  }
  if (isNaN(Number(taskId))) {
    history.push(`/subjects/${subjectId}/tasks`);
    return null;
  }
  const [componentUid] = useCancelableRequests('Tasks/TaskList/ForTeacher/ChangeTaskPage');

  /**
   * @type {[
   *   import('DBModels').Task,
   *   React.Dispatch<React.SetStateAction<import('DBModels').Task>>
   * ]}
   */
  const [task, setTask] = useState({
    id: null,
    fileIds: [],
    title: null,
    description: null,
  });
  const [taskLoading, setTaskLoading] = useState(true);
  useEffect(() => {
    http.get('/task/search-by-ids', {
      params: { ids: [taskId] },
      forCancel: { componentUid },
    })
    .then((response) => {
      setTask(response.data[0]);
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Не удалось получить список заданий', error), 5);
    }))
    .finally(() => {
      setTaskLoading(false);
    });
  }, [subjectId, taskId, componentUid]);

  return (
    <Spin spinning={taskLoading}>
      <h2>{task.title}</h2>
      <p>
        {task.description}
      </p>
      <Divider/>
      <div>
        <h6>Дополнительные файлики</h6>
        <FilesView
          key={task.id}
          fileIds={task.fileIds}
        />
      </div>
    </Spin>
  );
}
