import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  Row,
  Col,
  Spin,
  message,
} from 'antd';
import { Helmet } from 'react-helmet';
import {
  useParams,
  useHistory,
} from 'react-router-dom';
import classnames from 'classnames';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import BlueDownloadBook from 'components/icons/BlueDownloadBook';
import RedDownloadBook from 'components/icons/RedDownloadBook';
import classes from 'pages/Subjects/ListReferences/index.module.scss';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import useOnce from 'utils/useOnce';
import http from 'plugins/http';
import store from 'globalStore';
import {
  ROLES,
  LITERATURE_TYPES,
  literatureTypeTranslator,
} from 'globalStore/constants';
import {
  downloadFileInURL,
  loadFileFromURL,
} from 'components/FileView';

/**
 * Иконки в списке литературы
 */
const literatureTypesIcons = {
  [LITERATURE_TYPES.BOOK]: <BlueDownloadBook/>,
  [LITERATURE_TYPES.WORKBOOK]: <RedDownloadBook/>,
};

/**
 * Страница списка литературы
 */
export default function Index() {
  const history = useHistory();
  const { subjectId } = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(subjectId))) {
    history.push('/subjects');
    return null;
  }
  const [componentUid] = useCancelableRequests('Subjects/ListReferences/Index');

  const [loading, setLoading] = useState(true);
  /**
   * @type {[
   *   import('DBModels').Literature[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').Literature[]>>,
   * ]}
   */
  const [literatureList, setLiteratureList] = useState([]);
  /**
   * @type {[
   *   import('DBModels').Subject,
   *   React.Dispatch<React.SetStateAction<import('DBModels').Subject>>,
   * ]}
   */
  const [subject, setSubject] = useState({});

  useOnce(() => {
    http.get('/subject/search-by-ids', {
      params: { ids: [subjectId] },
      forCancel: { componentUid },
    })
    .then((response) => {
      setSubject(response.data[0]);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить название предмета', error), 5);
    }));

    const request = store.userRole === ROLES.USER ?
      http.get('/literature/learning', {
        params: {
          subjectId: subjectId,
          userId: store.userId,
        },
        forCancel: { componentUid },
      })
      :
      http.get('/literature', {
        params: { subjectId },
        forCancel: { componentUid },
      });

    request.then((response) => {
      setLiteratureList(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить список дополнительной литературы', error), 5);
    }))
    .finally(() => {
      setLoading(false);
    });
  });

  /**
   * @type {React.MutableRefObject<{
   *   [literatureId: string]: string,
   * }>}
   */
  const literatureListURLs = useRef({});
  useEffect(() => {
    /**
     * Запоминание ссылки @see literatureListURLs ,
     * чтобы очистить нужный current.
     * P.S. предупреждение от React
     */
    const _literatureListURLs = literatureListURLs;
    return () => {
      Object.values(_literatureListURLs.current).forEach(URL.revokeObjectURL);
    };
  }, []);
  const downloadFile = useCallback(
    /**
     * @param {import('DBModels').Literature} literature
     */
    (literature) => {
      if (literature.id in literatureListURLs.current) {
        loadFileFromURL(literatureListURLs.current[literature.id], literature.title);
        return;
      }

      if (!literature.fileIds.length) {
        message.warning('Не найден файл для скачивания', 3);
        return;
      }
      downloadFileInURL(literature.fileIds[0], literature.title, componentUid)
      .then((literatureURL) => {
        literatureListURLs.current[literature.id] = literatureURL;
        loadFileFromURL(literatureURL, literature.title);
      });
    },
    [componentUid],
  );

  return (
    <>
      <Helmet>
        <title>Дополнительная литература</title>
      </Helmet>
      <h4>
        Дополнительная литература предмета "{subject.name || 'Он загружается...'}"
      </h4>
      <Spin spinning={loading}>
        <Row
          className="mt-3"
          gutter={[24, 24]}
        >
          {literatureList.map((literature) => (
            <Col
              key={literature.id}
              className={classes['literature-card']}
              span={24}
              sm={12}
              md={8}
              lg={6}
              xxl={4}
              onClick={() => { downloadFile(literature); }}
            >
              <div className="d-flex">
                {literatureTypesIcons[literature.type] || <ExclamationCircleOutlined/>}
                <h5 className="text-center flex-grow-1 text-break">
                  {literature.title}
                </h5>
              </div>
              <div>
                <b className={classes['special-width']}>
                  Автор(ы):
                </b>
                {literature.authors}
              </div>
              <div>
                <b className={classes['special-width']}>
                  Описание:
                </b>
                {literature.description}
              </div>
              <div className="text-center">
                <span
                  className={classnames(classes['literature-type'], {
                    [classes['blue-container']]: (literature.type === LITERATURE_TYPES.BOOK),
                    [classes['red-container']]: (literature.type === LITERATURE_TYPES.WORKBOOK),
                  })}
                >
                  {literatureTypeTranslator(literature.type)}
                </span>
              </div>
            </Col>
          ))}
        </Row>
      </Spin>
    </>
  );
}
