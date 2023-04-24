import React, { useState } from 'react';
import {
  Space,
  Spin,
} from 'antd';
import { observer } from 'mobx-react';
import {
  makeObservable,
  observable,
  computed,
  action,
  runInAction,
} from 'mobx';

import useCancelableRequests from 'plugins/http/useCancelableRequests';
import { BooleanState } from 'plugins/mobx/fields';
import { createDecoratedErrorMessage } from 'utils/decorateMessage';
import http from 'plugins/http';
import FileView from 'components/FileView';
import useOnce from 'utils/useOnce';
import BaseState from 'plugins/mobx/BaseState';


/** @extends {BaseState<import('./FilesView').Props>} */
class State extends BaseState {
  loading = new BooleanState(true);
  files = [];

  constructor() {
    super();
    makeObservable(this, {
      files: observable.shallow,
      FileViewComponents: computed,
      searchFiles: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get FileViewComponents() {
    return this.files.map((file) => (
      <FileView
        key={file.id}
        file={file}
      />
    ));
  }

  searchFiles() {
    if (!this.props.fileIds || !this.props.fileIds.length) {
      this.loading.value = false;
      return;
    }
    http.get('/files/search-by-ids', {
      params: { ids: this.props.fileIds },
      forCancel: this.cancelableRequests,
    })
    .then((response) => {
      runInAction(() => {
        this.files = response.data;
      });
    })
    .catch(http.ifNotCancel((error) => {
      createDecoratedErrorMessage(http.parseError(
        'Не удалось получить список файлов', error), 5);
    }))
    .finally(this.loading.setFalse);
  }
}

/**
 * Представление файлов с возможностью их скачать.
 * Показываются в строчку с переносом.
 *
 * @param {{ fileIds: number[] }} props
 */
function FilesView(props) {
  const [componentUid] = useCancelableRequests(
    `components/FilesView/${props.fileIds ? props.fileIds.join(',') : Math.random()}`
  );

  const state = useState(State.create)[0];
  state.props = props;
  state.cancelableRequests.componentUid = componentUid;
  useOnce(state.searchFiles);

  if (!props.fileIds || !props.fileIds.length) {
    return '*А вот нет ничего*';
  }

  return (
    <Spin spinning={state.loading.value}>
      <Space wrap>
        {state.FileViewComponents}
      </Space>
    </Spin>
  );
}
export default observer(FilesView);
