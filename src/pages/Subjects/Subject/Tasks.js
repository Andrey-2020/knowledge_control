import React, { useState } from 'react';
import {
  Row,
  Spin,
} from 'antd';
import {
  useParams,
  useHistory,
} from 'react-router-dom';

import useOnce from 'utils/useOnce';
import http from 'plugins/http';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import StatisticsRed from 'components/icons/StatisticsRed';
import classes from 'pages/Subjects/Subject/card.module.css';
import store from 'globalStore';
import { ROLES } from 'globalStore/constants';

/**
 * Список заданий на странице конкретного предмета
 */
export default function Tasks() {
  const history = useHistory();
  // Можно не проверять, так как оно отредерится только если subjectId норм
  const { subjectId } = useParams();
  const [componentUid] = useCancelableRequests('Subjects/Subject/Tasks');

  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  useOnce(() => {
    http.get(store.userRole === ROLES.USER ?
      '/task/learning' : '/task/teaching', {
      params: { subjectId: subjectId },
      forCancel: { componentUid },
    })
    .then((response) => {
      setTaskList(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить список заданий предмета', error), 5);
    }))
    .finally(() => {
      setLoading(false);
    });
  });

  return (
    <Spin spinning={loading}>
      <Row className="flex-column">
        {taskList.length ? taskList.map((task) => (
          <div
            key={task.id}
            className={classes['card']}
            onClick={() => { history.push(`/subjects/${subjectId}/tasks`); }}
          >
            <StatisticsRed className="float-left"/>
            {task.title}
            <br/>
            <small>
              {task.description}
            </small>
          </div>
        ))
        :
        'Пусто...'
        }
      </Row>
    </Spin>
  );
}
