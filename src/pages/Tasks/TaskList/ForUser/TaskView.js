import React, {
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  Divider,
  Table,
  Card,
  Col,
  Row,
  Typography,
} from 'antd';
import {
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons'

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import useOnce from 'utils/useOnce';
import http from 'plugins/http';
import store from 'globalStore';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import FilesView from 'components/FilesView';
import SendedFilesView from 'pages/Tasks/TaskList/ForUser/SendedFilesView';
import SendWorkModal from 'pages/Tasks/TaskList/ForUser/SendWorkModal';
import Put3Please from 'pages/Tasks/TaskList/ForUser/Put3Please';
import classes from 'pages/Tasks/TaskList/ForUser/index.module.css';
import {
  MARK_TYPES,
  markTypeTranslator,
} from 'globalStore/constants';

/** Цвет текста в зависимости от оценки */
const MARK_TYPES_TEXT_TYPE = {
  [MARK_TYPES.FIVE]: 'success',
  [MARK_TYPES.FOUR]: 'secondary',
  [MARK_TYPES.THREE]: 'warning',
  [MARK_TYPES.UNSATISFACTORILY]: 'danger',
};

const CHECKING_RESULT_BY_MARK = {
  [MARK_TYPES.UNSATISFACTORILY]: 'Проверено, отправлено на доработку',
  [MARK_TYPES.THREE]: `Кое-как (оценка: ${markTypeTranslator(MARK_TYPES.THREE)})`,
  [MARK_TYPES.FOUR]: `Принято, но можно и получше (оценка: ${markTypeTranslator(MARK_TYPES.FOUR)})`,
  [MARK_TYPES.FIVE]: `Сдано целиком и полностью (оценка: ${markTypeTranslator(MARK_TYPES.FIVE)})`,
};

const NOT_PASSED = 'Не сдано';
const PASSED = 'Сдано';

/** @type {import('antd/lib/table').ColumnsType} */
const columns = [
  {
    dataIndex: 'studentComment',
    title: 'Ваш комментарий',
    render: (text) => text || '*Молчание*',
  },
  {
    dataIndex: 'fileIds',
    title: 'Ваши файлы',
    render: (_, record) => <SendedFilesView fileIds={record.fileIds}/>,
  },
  {
    dataIndex: 'mark',
    title: 'Оценка учителя',
    render: (_, record) => (
      <>
        <Typography.Text type={MARK_TYPES_TEXT_TYPE[record.mark]}>
          {record.mark ? markTypeTranslator(record.mark) : 'Не оценено'}
        </Typography.Text>
        {record.teacherComment && (
          <>
            &nbsp;(
            <Typography.Text type={MARK_TYPES_TEXT_TYPE[record.mark]}>
              {record.teacherComment}
            </Typography.Text>
            )
          </>
        )}

      </>
    ),
  },
];

/**
 * Отображение задания вместе с предыдущими попытками сдачи
 *
 * @param {...import('DBModels').Task}
 */
export default function TaskView({ id, title, description, fileIds }) {
  const [componentUid] = useCancelableRequests('Tasks/TaskList/ForUser/TaskView');

  /**
   * @type {[
   *   import('DBModels').Work[],
   *   React.Dispatch<React.SetStateAction<import('DBModels').Work[]>>,
   * ]}
   */
  const [works, setWorks] = useState([]);
  /**
   * @type {{
   *    status: string,
   *    result: string,
   *    teacherComment: string,
   * }}
   */
  const checkingInfo = useMemo(() => {
    const result = {
      status: null,
      result: null,
      teacherComment: null,
    };
    if (!works.length) {
      result.status = NOT_PASSED;
      result.result = 'Попыток сдачи не было';
      result.teacherComment = '*Комментировать нечего*';
    } else {
      const selectedWork = works[works.length - 1];
      if (!selectedWork.mark) {
        result.status = NOT_PASSED;
        result.result = '*Не просмотрено*';
        result.teacherComment = '*И не прокомментировано*';
      } else {
        result.status = selectedWork.mark !== MARK_TYPES.UNSATISFACTORILY ?
          PASSED : NOT_PASSED;
        result.result = CHECKING_RESULT_BY_MARK[selectedWork.mark];
        result.teacherComment = selectedWork.teacherComment;
      }
    }
    return result;
  }, [works]);
  const [workLoading, setWorkLoading] = useState(true);
  const getWorks = useCallback(() => {
    setWorkLoading(true);
    http.post('/work/criteria-search', [
      {
        key: 'userId',
        operation: '==',
        value: store.userId,
      },
      {
        key: 'taskId',
        operation: '==',
        value: id,
      },
    ], { forCancel: { componentUid } })
    .then((response) => {
      setWorks(response.data);
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить список сданных работ', error), 5);
    }))
    .finally(() => {
      setWorkLoading(false);
    });
  }, [id, componentUid]);
  useOnce(getWorks);

  return (
    <Row gutter={[20, 20]}>
      <Col md={16}>
        <div>
          <h3>{title}</h3>
          <Divider/>
          <h6>Описание работы:</h6>
          <p>{description}</p>
          <Divider/>
          <h6>Дополнительные файлики:</h6>
          <FilesView fileIds={fileIds}/>
          <Divider/>
          <Card
            className="bottom-card text-dark-3-text"
            size="small"
            headStyle={{
              fontWeight: "500",
              fontSize: "20px",
            }}
            bordered
            title="Ответы преподавателя"
          >
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              loading={workLoading}
              columns={columns}
              dataSource={works}
            />
          </Card>
          <Divider/>
          <Row justify="space-between">
            <SendWorkModal
              key={id}
              taskId={id}
              onSend={getWorks}
            />
            <Put3Please/>
          </Row>
        </div>
      </Col>
      <Col md={8}>
        <Card
          className={classes['side-card']}
          size="small"
        >
          <div className="mb-4">
            <div className="d-flex align-items-center border-bottom-text">
              <ClockCircleOutlined className="mr-2 icon-size--middle"/>
              <b>Срок сдачи:</b>
            </div>
            <small className="ml-4">
              До зачётной недели
            </small>
          </div>
          <div className="mb-4">
            <div className="d-flex align-items-center border-bottom-text">
              <WarningOutlined className="mr-2 icon-size--middle"/>
              <b>Статус:</b>
            </div>
            <small className="ml-4">
              {checkingInfo.status}
            </small>
          </div>
          <div className="mb-4">
            <div className="d-flex align-items-center border-bottom-text">
              <CheckCircleOutlined className="mr-2 icon-size--middle"/>
              <b>Результат проверки:</b>
            </div>
            <small className="ml-4">
              {checkingInfo.result}
            </small>
          </div>
          <div>
            <div className="d-flex align-items-center border-bottom-text">
              <MessageOutlined className="mr-2 icon-size--middle"/>
              <b>Ответ преподавателя:</b>
            </div>
            <small className="ml-4">
              {checkingInfo.teacherComment}
            </small>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
