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
import store from 'globalStore';
import { literatureTypeTranslator } from 'globalStore/constants';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import Literature from 'components/icons/Literature';
import classes from 'pages/Subjects/Subject/card.module.css';
import { ROLES } from 'globalStore/constants';

/**
 * Список литературы на странице конкретного предмета
 */
export default function LiteratureList() {
  const history = useHistory();
  // Можно не проверять, так как оно отредерится только если subjectId норм
  const { subjectId } = useParams();
  const [componentUid] = useCancelableRequests('Subjects/Subject/LiteratureList');

  /**
   * @type {[
   *   import('DBModels').Literature[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').Literature[]>>,
   * ]}
   */
  const [literatureList, setLiteratureList] = useState([]);
  const [loading, setLoading] = useState(true);
  useOnce(() => {
    const request = store.userRole === ROLES.USER ? (
      http.get('/literature/learning', {
        params: {
          subjectId: subjectId,
          userId: store.userId,
        },
        forCancel: { componentUid },
      })) : (
      http.get('/literature', {
        params: { subjectId },
        forCancel: { componentUid },
      }));

    request.then((response) => {
      setLiteratureList(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить список литературы предмета', error), 5);
    }))
    .finally(() => {
      setLoading(false);
    });
  });

  return (
    <Spin spinning={loading}>
      <Row className="flex-column">
        {literatureList.length ? literatureList.map((literature) => (
          <div
            key={literature.id}
            className={classes['card']}
            onClick={() => { history.push(`/subjects/${subjectId}/list-references`); }}
          >
            <Literature className="float-left"/>
            {`${literatureTypeTranslator(literature.type)}: ${literature.title}`}
            <br/>
            <small>
              {literature.description}
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
