import React, { useState } from 'react';
import {
  Modal,
  Button,
  Input,
  Tag,
  Tooltip,
  Space,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  makeObservable,
  observable,
  computed,
  action,
  reaction,
} from 'mobx';
import { observer } from 'mobx-react'; 

import BaseState from 'plugins/mobx/BaseState';
import useOnceWithRevoke from 'utils/useOnceWithRevoke';


/**
 * @param {string} text
 * @returns {string}
 */
 function getColorByText(text) {
  const firstLetter = text[0],
    thirdLetter = text.charAt(2) || '0';
  
  const firstLetterCharCode = firstLetter.charCodeAt(0),
    thirdLetterCharCode = thirdLetter.charCodeAt(0);

  const firstLetterHex = (firstLetterCharCode * thirdLetterCharCode).toString(16).padStart(3, '9').slice(-3),
    thirdLetterHex = (firstLetterCharCode ^ thirdLetterCharCode).toString(16).padStart(3, '9').slice(-3);

  return `#${firstLetterHex[0]}${thirdLetterHex[2]}${firstLetterHex[1]}${thirdLetterHex[1]}${firstLetterHex[2]}${thirdLetterHex[0]}`;
}

/** @extends {BaseState<import('./VisitCommentModal').Props>} */
class State extends BaseState {
  initialComment = '';
  comment = '';

  /** @type {string[]} */
  mostPopularComments = [];

  constructor() {
    super();
    makeObservable(this, {
      initialComment: observable,
      comment: observable,
      mostPopularComments: observable.ref,
      mostPopularCommentsComponent: computed,
      setProps: action.bound,
      setComment: action.bound,
      addToComment: action.bound,
      change: action.bound,
      reset: action.bound,
      resetIfHide: action.bound,
      createResetReaction: action.bound,
    });
  }

  static create() {
    return new State();
  }

  get mostPopularCommentsComponent() {
    const result = [];
    const countComponents = Math.min(this.mostPopularComments.length, 10);
    for (let i = 0; i < countComponents; i++) {
      result.push(
        <Tag
          key={this.mostPopularComments[i]}
          className="cursor-pointer"
          color={getColorByText(this.mostPopularComments[i])}
          onClick={() => { this.addToComment(this.mostPopularComments[i]); }}
          onContextMenu={(event) => {
            event.preventDefault();
            this.setComment({ target: { value: this.mostPopularComments[i] } });
          }}
        >
          {this.mostPopularComments[i]}
        </Tag>
      );
    }
    return result;
  }

  /** @param {import('./VisitCommentModal').Props} props */
  setProps(props) {
    this.props = props;
    if (props.comment !== this.initialComment) {
      this.initialComment = props.comment;
      this.reset();
    }
    if (props.mostPopularComments !== this.mostPopularComments) {
      this.mostPopularComments = props.mostPopularComments;
    }
  }

  /** @param {import('react').BaseSyntheticEvent} event */
  setComment(event) {
    this.comment = event.target.value;
  }

  /** @param {string} comment */
  addToComment(comment) {
    this.comment += ` ${comment}`;
  }

  change() {
    this.props.updateComment(this.comment);
  }

  reset() {
    this.comment = this.initialComment;
  }

  resetIfHide() {
    if (!this.props.visible.value) {
      this.reset();
    }
  }

  createResetReaction() {
    return reaction(
      () => this.props.visible.value,
      this.resetIfHide,
    );
  }
}

/** @param {import('./VisitCommentModal').Props} props */
function VisitCommentModal(props) {
  const state = useState(State.create)[0];
  state.setProps(props);
  useOnceWithRevoke(state.createResetReaction);

  return (
    <Modal
      title="Комментарий"
      footer={null}
      visible={props.visible.value}
      onOk={props.visible.setFalse}
      onCancel={props.visible.setFalse}
    >
      <div className="border p-2">
        <h6>
          Популярные комментарии
          <Tooltip
            title={(
              <>
                ЛКМ - добавить выбранный комментарий к текущему
                <br/>
                ПКМ - заменить текущий комментарий на выбранный
              </>
            )}
          >
            <QuestionCircleOutlined className="ml-2" />
          </Tooltip>
        </h6>
        <Space className="flex-wrap">
          {state.mostPopularCommentsComponent}
        </Space>
      </div>
      <Input.TextArea
        value={state.comment}
        onChange={state.setComment}
      />
      <Button
        className="mt-3"
        block
        type="primary"
        disabled={state.comment === state.initialComment}
        onClick={state.change}
      >
        Подтвердить
      </Button>
    </Modal>
  );
}
export default observer(VisitCommentModal);
