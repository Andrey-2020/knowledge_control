import React, {
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  Button,
  Modal,
  Form,
  message,
  Input,
} from 'antd';
import {
  useLocalObservable,
  observer,
} from 'mobx-react';

import useBool from 'utils/useBool';
import { maxLength } from 'utils/formRules';
import http from 'plugins/http';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import FilesLoader, { onChangeArgsDefault } from 'components/FilesLoader';

/**
 * Моддальное окно отправки работы по заданию
 *
 * @param {{
 *   taskId: number,
 *   onSend: () => void,
 * }}
 */
function SendWorkModal({ taskId, onSend }) {
  const [form] = Form.useForm();
  /** @type {React.MutableRefObject<() => void} */
  const filesLoaderComponentReset = useRef(null);
  /**  @type {import('CommonTypes').FormRules} */
  const rules = useLocalObservable(() => ({
    studentComment: [maxLength.standard],
  }));

  const [files, setFiles] = useState(onChangeArgsDefault);

  const [visible, falseVisible, trueVisible] = useBool(false);

  /**
   * @type {[
   *   import('antd/lib/message').MessageType,
   *   React.Dispatch<React.SetStateAction<import('antd/lib/message').MessageType>>
   * ]}
   */
  const [loading, setLoading] = useState(null);

  const send = useCallback(
    /**
     * @param {{
     *   studentComment: string,
     * }} formData
     */
    (formData) => {
      if (!formData.studentComment && !files.loaded.length) {
        message.warning('А что отправлять-то?', 3);
        return;
      }

      if (files.unloaded) {
        message.warning('Имеются незагруженные файлы', 3);
        return;
      }

      const _loading = message.loading('Решение отправляется, пожалуйста, подождите...', 0);
      setLoading(_loading);
      http.post('/work', {
        ...formData,
        fileIds: files.loaded,
        taskId,
      })
      .then(() => {
        falseVisible();
        onSend();
        message.success('Решение задания успешно отправлено', 3);
        form.resetFields();
        filesLoaderComponentReset.current();
      })
      .catch((error) => {
        createDecoratedErrorMessage(http.parseError(
          'Не удалось отправить решение задания', error), 5);
      })
      .finally(() => {
        _loading();
        setLoading(null);
      });
    },
    [files, taskId, falseVisible, form, onSend],
  );

  return (
    <>
      <Button
        className="linear-gradient-button"
        size="large"
        onClick={trueVisible}
      >
        Отправить на проверку
      </Button>
      <Modal
        title="Отправка ответа на задание"
        footer={false}
        visible={visible}
        onOk={falseVisible}
        onCancel={falseVisible}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={send}
        >
          <Form.Item
            label="Сообщение преподавателю:"
            name="studentComment"
            rules={rules.studentComment}
          >
            <Input.TextArea placeholder="Сообщение преподавателю"/>
          </Form.Item>
          <Form.Item label="Файлы:">
            <FilesLoader
              componentReset={useCallback((resetFunction) => {
                filesLoaderComponentReset.current = resetFunction;
              }, [])}
              onChange={setFiles}
            />
          </Form.Item>
          <Button
            className="w-100 linear-gradient-button"
            type="primary"
            htmlType="submit"
            disabled={files.unloaded > 0 || loading}
          >
            Отправить
          </Button>
        </Form>
      </Modal>
    </>
  );
}
export default observer(SendWorkModal);
