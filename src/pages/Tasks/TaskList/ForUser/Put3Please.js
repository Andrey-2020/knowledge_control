import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  Button,
  message,
} from 'antd';
import debounce from 'lodash/debounce';
import classnames from 'classnames';

import classes from 'pages/Tasks/TaskList/ForUser/Put3Please.module.css';

export default function Put3Please() {
  return (
    <Button
      className="linear-gradient-button"
      size="large"
      onClick={random}
    >
      Поставьте 3, пожалуйста
    </Button>
  );
}

/** Случайные события при нажатии */
const randomEvents = [
  // rick roll
  () => { window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ') },
  // жаренные гвозди
  () => { window.open('https://youtu.be/DZRBnMm99ZI?t=3') },
  // сделаешь сам?
  doItYourself,
  // знаешь предмет?
  doYouKnowTheSubject,
];
function random() {
  randomEvents[Math.floor(Math.random() * randomEvents.length)]();
}

/** Три кнопки, последняя меняет текст */
function doItYourself() {
  function close() {
    message.destroy('Сделаешь сам?');
    setTimeout(() => {
      message.info('Ну сделаешь и сделаешь, что бубнить то?', 3);
    }, 250);
  }

  message.open({
    key: 'Сделаешь сам?',
    content: <DoItYourselfContent close={close}/>,
    duration: 0,
  });
}
/**
 * @param {{ close: () => void }}
 */
function DoItYourselfContent({ close }) {
  const [noText, setNoText] = useState('Нет');

  const onNoMouseEnter = useCallback(() => {
    setNoText('Сделаю сам');
  }, []);
  const onNoMouseLeave = useCallback(() => {
    setNoText('Нет');
  }, []);

  return (
    <>
      <h6>Сделаешь сам?</h6>
      <Button onClick={close}>
        Да
      </Button>
      <Button onClick={close}>
        Конечно
      </Button>
      <Button
        onMouseEnter={onNoMouseEnter}
        onMouseLeave={onNoMouseLeave}
        onClick={close}
      >
        {noText}
      </Button>
    </>
  );
}

/** Три кнопки, одна убегает */
function doYouKnowTheSubject() {
  function close() {
    message.destroy('Ты знаешь предмет?');
    message.success('Значит сделаешь сам');
  }

  message.open({
    key: 'Ты знаешь предмет?',
    content: <DoYouKnowTheSubjectContent close={close}/>,
    duration: 0,
  });
}
/**
 * @param {{ close: () => void }}
 */
function DoYouKnowTheSubjectContent({ close }) {
  /** 
   * @type {[
   *   import('./Put3Please').Coordinates,
   *   React.Dispatch<React.SetStateAction<import('./Put3Please').Coordinates>>,
   * ]}
   */
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    /** Получить убегающую кнопку */
    const noButtonElement = document.querySelector('.random--no-button');
    setTimeout(() => {
      /** Получить координаты, запомнить их */
      const noButtonCoordinates = noButtonElement.getBoundingClientRect();
      setCoordinates({
        left: noButtonCoordinates.left,
        top: noButtonCoordinates.top,
      });
    }, 250);

    /** Перемещать кнопку, если курсор приблизился */
    const mouseTracking = debounce(
      /** @param {MouseEvent} event */
      (event) => {
        const noButtonCoordinates = noButtonElement.getBoundingClientRect();
        /** 50 и 16 - поправки, чтобы расстояние считалось от центра кнопки */
        if (Math.sqrt(
            (event.clientX - noButtonCoordinates.left - 50) *
              (event.clientX - noButtonCoordinates.left - 50) +
            (event.clientY - noButtonCoordinates.top - 16) *
              (event.clientY - noButtonCoordinates.top - 16)
            ) < 100) {
          /** Перемещение от курсора на 100px */
          setCoordinates({
            left: event.clientX - 100 + (200 * (event.clientX <= noButtonCoordinates.left)),
            top: event.clientY - 100 + (200 * (event.clientY <= noButtonCoordinates.top)),
          });
        }
      },
    50, { maxWait: 50 });

    /**
     * Следить за движением мыши,
     * при unmount'е компонента удалить прослушку события
     */
    document.body.addEventListener('mousemove', mouseTracking);
    return () => { document.body.removeEventListener('mousemove', mouseTracking); };
  }, [])

  /** Если всё же кликни */
  const onNoClick = useCallback(() => {
    message.info('Думал, всё так просто?', 3);
  }, []);

  return (
    <>
      <h6>Ты знаешь предмет?</h6>
      <div
        className="text-left"
        style={{ width: '300px' }}
      >
        <Button
          className={classes['w-100-px']}
          onClick={close}
        >
          Да
        </Button>
        <Button
          className={classes['w-100-px']}
          onClick={close}
        >
          Согласен
        </Button>
        <Button
          className={classnames('position-fixed random--no-button', classes['w-100-px'])}
          style={coordinates}
          onClick={onNoClick}
        >
          Нет
        </Button>
      </div>
    </>
  );
}
