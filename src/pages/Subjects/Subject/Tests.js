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
import StatisticsGreen from 'components/icons/StatisticsGreen';
import classes from 'pages/Subjects/Subject/card.module.css';

/**
 * Список тестов на странице конкретного предмета
 */
export default function Tests() {
  const history = useHistory();
  // Можно не проверять, так как оно отредерится только если subjectId норм
  const { subjectId } = useParams();
  const [componentUid] = useCancelableRequests('Subjects/Subject/Tests');

  const [testList, setTestList] = useState([]);
  const [loading, setLoading] = useState(true);
  useOnce(() => {
    http.get('api/testing/themes', {
      params: { subj_id: subjectId },
      forCancel: { componentUid },
    })
    .then((response) => {
      setTestList(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить список тестов предмета', error), 5);
    }))
    .finally(() => {
      setLoading(false);
    });
  });

  return (
    <Spin spinning={loading}>
      <Row className="flex-column">
        {testList.length ? testList.map((test) => (
          <div
            key={test.id}
            className={classes['card']}
            onClick={() => { history.push(`/subjects/${subjectId}/tests/${test.id}`); }}
          >
            <StatisticsGreen className="float-left"/>
            {test.name}
            <br/>
            <small>
              {test.decryption}
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
