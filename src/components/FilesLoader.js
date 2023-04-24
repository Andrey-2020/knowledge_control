import React, { useState } from 'react';
import {
  makeObservable,
  observable,
  computed,
  action,
} from 'mobx';
import { observer } from 'mobx-react';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import ObjectClear from 'utils/ObjectClear';
import FileLoader from 'components/FileLoader';
import BaseState from 'plugins/mobx/BaseState';


/**
 * Изначальное состояние, можно использовать для инициализации
 *
 * @type {import('./FilesLoader').onChangeArgs}
 */
export function onChangeArgsDefault() {
  return {
    unloaded: 0,
    loaded: [],
  };
}

/** @extends {BaseState<import('./FilesLoader').Props>} */
class State extends BaseState {
  /** @type {number[]} */
  fileList = [];
  /** @type {{ [fileUid: string]: number }} */
  loadedFiles = {};
  /** @type {string[]} */
  unloadedFiles = new Set();

  constructor() {
    super();
    makeObservable(this, {
      fileList: observable.shallow,
      FileLoaderComponentList: computed,
      emitOnChange: action.bound,
      reset: action.bound,
      addFile: action.bound,
      removeFile: action.bound,
      setFileLoadedState: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get FileLoaderComponentList() {
    return this.fileList.map((file) => (
      <FileLoader
        key={file.uid}
        file={file}
        onRemove={this.removeFile}
        onLoad={this.setFileLoadedState}
      />
    ));
  }

  emitOnChange() {
    this.props.onChange({
      unloaded: this.unloadedFiles.size,
      loaded: Object.values(this.loadedFiles),
    });
  }

  // Функция для reset'а состояния компонента
  reset() {
    this.fileList = [];
    ObjectClear(this.loadedFiles);
    this.unloadedFiles.clear();
    this.emitOnChange();
  }

  addFile(file) {
    if (!file) {
      return;
    }
    this.unloadedFiles.add(file.uid);
    this.fileList.push(file);

    this.emitOnChange();

    // Требуется вернуть false, чтобы не начать загрузку
    return false;
  }

  removeFile(file) {
    this.unloadedFiles.delete(file.uid);
    delete this.loadedFiles[file.uid];
    this.fileList.splice(this.fileList.indexOf(file), 1);
    this.emitOnChange();
  }

  setFileLoadedState(file, id) {
    this.unloadedFiles.delete(file.uid);
    this.loadedFiles[file.uid] = id;
    this.emitOnChange();
  }
}

/**
 * Загрузчик файлов на сервер, контролирует список файлов
 *
 * @param {import('./FilesLoader').Props} props
 */
function FilesLoader(props) {
  const state = useState(State.create)[0];
  state.props = props;
  // Передача функция для reset'а состояния компонента наверх к родителю
  state.props.componentReset(state.reset);

  return (
    <>
      <Upload.Dragger
        multiple
        fileList={state.fileList}
        showUploadList={false}
        beforeUpload={state.addFile}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined/>
        </p>
        <p className="ant-upload-text">
          Нажмите сюда или перенесите файл в эту область для его загрузки
        </p>
        <p className="ant-upload-hint">
          Можно загружать сразу много файлов
        </p>
      </Upload.Dragger>
      <div>
        {state.FileLoaderComponentList}
      </div>
    </>
  );
}
export default observer(FilesLoader);
