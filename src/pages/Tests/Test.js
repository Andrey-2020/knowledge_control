import React, {
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  useParams,
  useHistory,
} from 'react-router-dom';
import Countdown, { zeroPad } from 'react-countdown';
import {
  Button,
  message,
  Modal,
  Spin,
  Row,
  Col,
  Card,
  Space,
  Anchor,
} from 'antd';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import classnames from 'classnames';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import useOnce from 'utils/useOnce';
import http from 'plugins/http';
import Question from 'pages/Tests/Question';
import 'pages/Tests/Test.scss';
import classes from 'pages/Tests/Test.module.css';

/**
 * Тест для пользователя
 */
export default function Test() {
  const history = useHistory();
  const { subjectId, themeId } = useParams();
  /* eslint-disable react-hooks/rules-of-hooks */
  if (isNaN(Number(subjectId))) {
    history.push('/subjects');
    return null;
  }
  if (isNaN(Number(themeId))) {
    history.push(`/subjects/${subjectId}/tests`);
    return null;
  }
  const [componentUid] = useCancelableRequests('Tests/Test');

  /**
   * @type {[
   *   import('DBModels').Question[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').Question[]>>,
   * ]}
   */
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useOnce(() => {
    http.get('/testing/new/test', {
      params: {
        subj_id: subjectId,
        theme_id: themeId,
        limit: 3,
      },
      forCancel: { componentUid }
    })
      .then((response) => {
        console.log({ test: response })
        setQuestions(response.data);
        // setTime(1200 * 1000)
      })
      .catch(http.ifNotCancel((error) => {
        message.error(http.parseError(
          'Не удалось получить вопросы теста', error), 5);
      }))
      .finally(() => {
        setLoading(false);
      });
  });

  /**
   * @type {[
   *   import('./Test').TestAnswers,
   *   React.Dispatch<React.SetStateAction<import('./Test').TestAnswers>>,
   * ]}
   */
  const [userAnswers, setUserAnswers] = useState({});

  /** Выставление ответа на вопрос */
  const answerOnQuestion = useCallback(
    /**
     * @param {number} questionId
     * @param {import('./Test').Answer} answer
     */
    (questionId, answer) => {
      setUserAnswers((oldUserAnswers) => ({
        ...oldUserAnswers,
        [questionId]: answer,
      }));
    },
    [],
  );

  /**
   * @type {[
   *   number?,
   *   React.Dispatch<React.SetStateAction<number?>>,
   * ]}
   */
  const [userRating, setUserRating] = useState(null);
  const testFinished = useMemo(() => userRating !== null, [userRating]);

  const pathToSubject = useMemo(() => `/subjects/${subjectId}/tests`, [subjectId]);

  const sendUserAnswers = useCallback(() => {
    /**
     * Формирование массива вопросов в серверный формат
     * 
     * @type {import('./Test').TestAnswersForServer}
     */
    const parsedAnswers = [];
    for (const { id } of questions) {
      parsedAnswers.push({
        "questionId": id,
        "answers": userAnswers[id] || [],
      });
    }

    setLoading(true);
    http.post('testing/new/test/check',
      parsedAnswers,
      { forCancel: { componentUid } },
    )
    .then((response) => {
      setUserRating(response.data.rating);
      Modal.info({
        title: 'Тест завершён',
        icon: <InfoCircleOutlined />,
        content: `Результат: ${response.data.rating} из 100`,
        okText: 'Закрыть тест',
        onOk() {
          history.push(pathToSubject);
        },
      });
    })
    .catch(http.ifNotCancel((error) => {
      message.error(http.parseError(
        'Не удалось отправить ваши ответы на тест', error), 5);
    }))
    .finally(() => {
      setLoading(false);
    });
  }, [questions, userAnswers, history, pathToSubject, componentUid]);

  /** Закрытие теста */
  const closeTest = useCallback(() => {
    /** Если тест закончен, то ничего не спрашиваем */
    if (testFinished) {
      history.push(pathToSubject);
      return;
    }
    /**
     * А если не закончен, то надо удостовериться
     * TODO: поставить такое подтверждение на уход со страницы или с сайта
     */
    Modal.confirm({
      title: 'Вы уверены, что хотите закрыть тест? Ответы не сохранятся',
      icon: <ExclamationCircleOutlined />,
      onOk: sendUserAnswers,
      onCancel() { },
    });
  }, [testFinished, history, pathToSubject, sendUserAnswers]);

  /** Компонент карточек с вопросами */
  const questionsComponent = useMemo(() => {
    return questions.map((question, index) => (
      <Card
        key={question.id}
        className="mt-3"
        title={(
          <span id={`question-${index}`}>
            Вопрос {index + 1}/{questions.length}
          </span>
        )}
      >
        <Question
          {...question}
          onAnswer={(answer) => { answerOnQuestion(question.id, answer); }}
        />
      </Card>
    ));
  }, [questions, answerOnQuestion]);

  /** Компонент навигации по тесту */
  const questionsMapperComponent = useMemo(() => {
    if (userRating === null) {
      return (
        <Space wrap>
          {questions.map((question, index) => (
            <Anchor.Link
              key={question.id}
              className={classnames('p-0', classes['question-link-size'])}
              href={`#question-${index}`}
              title={(
                <Button
                  className={classnames('p-0', classes['question-link-size'])}
                  shape="round"
                  type={question.id in userAnswers ? 'primary' : 'default'}
                >
                  {index + 1}
                </Button>
              )}
            />
          ))}
        </Space>
      );
    }
    return `${userRating} из 100`;
  }, [userRating, questions, userAnswers]);
  /** Редактор кастомного таймера обратного отсчета */

  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return sendUserAnswers();
    } else {
      // Render a countdown
      if (hours !== 0) {
        return <span>{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
      } else {
        return <span>{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
      }
    }
  }
 const time = useMemo(() => {
  return Date.now() + 1200*1000;
}, []);

  const CountdownWrapper = () => <Countdown
    zeroPadTime={2}
    date={time}
    intervalDelay={0}
    precision={2}
    renderer={renderer}
  />;
  const MemoCountdown = React.memo(CountdownWrapper, []);
  return (
    <>
      <Helmet>
        <title>ТЕСТ ИДЁТ, СИДЕТЬ!</title>
      </Helmet>
      <Spin spinning={loading}>
        <div>
          <Button onClick={closeTest}>
            К списку тестов
          </Button>
        </div>
        <Row gutter={20}>
          <Col span={20}>
            {questionsComponent}
          </Col>
          <Col
            className="mt-3"
            span={4}
          >
            <Anchor
              offsetTop={20}
              className="no-anchor-ink"
            >
              <Card
                bodyStyle={{ padding: '8px 16px' }}
                title={userRating === null ?
                  <MemoCountdown />
                  // <Statistic.Countdown
                  //   value={Date.now() + 1000 * 60 * 20}
                  //   onFinish={sendUserAnswers}
                  // />
                  :
                  'Завершено'
                }
                actions={[
                  <Button
                    disabled={testFinished}
                    onClick={sendUserAnswers}
                  >
                    Закончить тест
                  </Button>
                ]}
              >
                Навигация по тесту:
                <br />
                {questionsMapperComponent}
              </Card>
            </Anchor>
          </Col>
        </Row>
      </Spin>
    </>
  );
}
