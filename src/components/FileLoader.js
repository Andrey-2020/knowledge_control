import React, { useState } from 'react';
import {
  makeObservable,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import {
  Progress,
  message,
} from 'antd';
import {
  FileFilled,
  DeleteOutlined,
} from '@ant-design/icons';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import http from 'plugins/http';
import { SettedState } from 'plugins/mobx/fields';
import BaseState from 'plugins/mobx/BaseState';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import progressFormat from 'utils/progressFormat';
import useOnce from 'utils/useOnce';


/** @extends {BaseState<import('./FileLoader').Props>} */
class State extends BaseState {
  progress = new SettedState(0);

  constructor() {
    super();
    makeObservable(this, {
      uploadFile: action.bound,
      cancelUploadFile: action.bound,
    });
  }

  static create() {
    return new State();
  }

  uploadFile() {
    uploadFile(
      this.props.file,
      this.cancelableRequests.componentUid, {
        onUploadProgress: (event) => {
          this.progress.set(event.loaded / event.total * 100);
        },
      }
    )
    .then((file) => {
      this.props.onLoad(this.props.file, file.id);
    });
  }

  cancelUploadFile() {
    this.cancelableRequests.cancelRequest(this.props.file.uid);
    this.props.onRemove(this.props.file);
  }
}

/**
 * Загрузчик отдельного файла
 *
 * @param {import('./FileLoader').Props} props
 */
function FileLoader(props) {
  const [componentUid, cancelRequest] = useCancelableRequests(`FileLoader(${props.file.uid})`);

  const state = useState(State.create)[0];
  state.props = props;
  state.cancelableRequests.componentUid = componentUid;
  state.cancelableRequests.cancelRequest = cancelRequest;
  useOnce(state.uploadFile);

  return (
    <>
      <div className="d-flex">
        <FileFilled/>
        <span className="ml-2 mr-auto">
          {props.file.name}
        </span>
        <DeleteOutlined
          onClick={state.cancelUploadFile}/>
      </div>
      <Progress
        style={{ width: 'calc(100% - 30px)' }}
        percent={state.progress.value}
        format={progressFormat}
      />
    </>
  );
}
export default observer(FileLoader);

/**
 * Загрузка файла на сервер
 *
 * @async
 * @param {File} file
 * @param {string} componentUid
 * @param {import('axios').AxiosRequestConfig} requestOptions
 *
 * @returns {Promise<import('DBModels').UserFile>}
 */
export async function uploadFile(file, componentUid, requestOptions) {
  const loading = message.loading(`Файл "${file.name}" загружается, подождите...`, 0);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await http.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0,
      forCancel: {
        componentUid,
        requestUid: file.uid,
      },
      ...(requestOptions || {}),
    });
    return response.data;
  } catch (error) {
    http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось загрузить файл', error), 5);
    }).call(null, error);
  } finally {
    loading();
  }
}
