import React from 'react';
import {
  Button,
  Modal,
} from 'antd';

import useBool from 'utils/useBool';
import FilesView from 'components/FilesView';

/**
 * Отображение отправленных работ студента с комментариями и файлами
 *
 * @param {{
 *   fileIds: number[],
 * }}
 */
export default function SendedFilesView({ fileIds }) {
  const [visible, falseVisible, trueVisible] = useBool(false);

  if (fileIds.length < 2) {
    return (
      <FilesView fileIds={fileIds}/>
    );
  }

  return (
    <>
      <Button
        size="small"
        type="primary"
        onClick={trueVisible}
      >
        Просмотреть
      </Button>
      <Modal
        title="Отправленные файлы"
        footer={false}
        visible={visible}
        onOk={falseVisible}
        onCancel={falseVisible}
      >
        <FilesView fileIds={fileIds}/>
      </Modal>
    </>
  );
}
