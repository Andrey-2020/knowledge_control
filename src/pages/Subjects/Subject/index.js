import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import {
  Row,
  Col,
  Skeleton,
  // Tag,
  Progress,
  Button,
} from 'antd';
import {
  useParams,
  useHistory,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { observer } from 'mobx-react';

import http from 'plugins/http';
import store from 'globalStore';
import useCancelableRequests from 'plugins/http/useCancelableRequests';
import progressFormat from 'utils/progressFormat';
// import {
//   CONTROL_TYPES,
//   controlTypeTranslator,
// } from 'globalStore/constants';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import Subtract from 'components/icons/Subtract';
import LiteratureList from 'pages/Subjects/Subject/LiteratureList';
import Tasks from 'pages/Subjects/Subject/Tasks';
import Tests from 'pages/Subjects/Subject/Tests';

/**
 * Цвета тега, который отвечает за тип контроля
 */
// const CONTROL_TYPES_TAG_COLORS = {
//   [CONTROL_TYPES.EXAM]: 'error',
//   [CONTROL_TYPES.CREDIT]: 'processing',
//   [CONTROL_TYPES.DIFFERENTIAL_CREDIT]: 'warning',
// };

/**
 * Страница информации о предмете
 */
function Index() {
  const history = useHistory();
  const { subjectId } = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(subjectId))) {
    history.push('/subjects');
    return null;
  }
  const [componentUid] = useCancelableRequests('Subjects/Subject/Index');

  const [loading, setLoading] = useState(true);
  /** 
   * @type {[
   *   import('DBModels').Subject[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').Subject[]>>,
   * ]}
   */
  const [subject, setSubject] = useState({});
  /**
   * @type {[
   *   import('DBModels').SubjectSemester[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').SubjectSemester[]>>,
   * ]}
   */
  // const [subjectSemester, setSubjectSemester] = useState({});

  useEffect(() => {
    if (!store.UserData.departmentId) {
      setLoading(false);
      return;
    }

    /**
     * Получение предмета по id из query
     */
    http.get('subject/search-by-ids', {
      params: { ids: [Number(subjectId)] },
      forCancel: { componentUid },
    })
    .then((response) => {
      const subject = response.data[0];
      setSubject(subject);
      /**
       * Поиск семестра по id, чтобы найти тип контроля
       * 
       * TODO: Потом переделать под критериальный поиск для оптимизации
       */
      // return http.get('subject-semester/search-by-ids', {
      //   params: { ids: subject.semesterIds },
      //   forCancel: { componentUid },
      // });
    })
    // .then((response) => {
    //   const subjectSemester = response.data.find(
    //     ({ departmentId }) => departmentId === store.UserData.departmentId
    //   );
    //   if (!subjectSemester) {
    //     createDecoratedErrorMessage(
    //       'Не удалось получить данные предмета: нет семестра для предмета', 5);
    //     return;
    //   }
    //   setSubjectSemester(subjectSemester);
    // })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить данные предмета', error), 5);
    }))
    .finally(() => {
      setLoading(false);
    });
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [subjectId, store.UserData.departmentId]);

  const titleJSX = useMemo(() => (
    <title>
      {subject.name ? `Предмет: ${subject.name}` : `Страница предмета ${subjectId}`}
    </title>
  ), [subject, subjectId]);

  return (
    <>
      <Helmet>
        {titleJSX}
      </Helmet>
      <div className="mx-4">
        <Button
          type="link"
          onClick={() => { history.push('/subjects'); }}
        >
          <Subtract/>
          Назад к списку предметов
        </Button>
      </div>
      <Row gutter={[20, 20]}>
        <Col span={8}>
          <img
            alt="Предмет"
            width="100%"
            src={`${process.env.PUBLIC_URL}/img/photo/Subject.png`}
          />
        </Col>
        <Col span={8}>
          <Skeleton
            active
            loading={loading}
          >
            <h3>
              {subject.name}
            </h3>
            {/* Сделать имя препода и кнопку с глазиком, чтобы посмотреть его данные */}
            <div className="mb-4">
              {subject.decryption}
            </div>
            {/* {subjectSemester.controlType && (
              <Tag color={CONTROL_TYPES_TAG_COLORS[subjectSemester.controlType]}>
                {controlTypeTranslator(subjectSemester.controlType)}
              </Tag>
            )} */}
          </Skeleton>
        </Col>
        <Col span={8}>
          <Row>
            <Col
              className="text-center"
              span={12}
            >
              <Progress
                className="w-100"
                strokeColor="var(--red-base)"
                type="circle"
                percent={75}
                format={progressFormat}
              />
              <small>Сдано работ</small>
            </Col>
            <Col
              className="text-center"
              span={12}
            >
              <Progress
                className="w-100"
                strokeColor="var(--blue-base)"
                type="circle"
                percent={75}
                format={progressFormat}
              />
              <small>Пройдено тестов</small>
            </Col>
          </Row>
        </Col>
        <Col span={8}>
          <h5>Литература</h5>
          <LiteratureList/>
        </Col>
        <Col span={8}>
          <h5>Работы</h5>
          <Tasks/>
        </Col>
        <Col span={8}>
          <h5>Тесты</h5>
          <Tests/>
        </Col>
      </Row>
    </>
  );
}

export default observer(Index);