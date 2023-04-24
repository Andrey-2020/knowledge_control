export default function Put3Please(): JSX.Element;

/** Случайные события при нажатии */
export declare const randomEvents = [
  // rick roll
  () => { window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ') },
  // жаренные гвозди
  () => { window.open('https://youtu.be/DZRBnMm99ZI?t=3') },
  // сделаешь сам?
  doItYourself,
  // знаешь предмет?
  doYouKnowTheSubject,
];
export function random(): void;

/**
 * Сообщение, где три кнопки, последняя меняет текст.
 * Рендерит @see DoItYourselfContent
 */
export function doItYourself(): void;
export function DoItYourselfContent(args: {
  close: () => void,
}): JSX.Element;

/**
 * Сообщение, где три кнопки, последняя убегает.
 * Рендерит @see DoYouKnowTheSubjectContent
 */
export function doYouKnowTheSubject(): void;
export function DoYouKnowTheSubjectContent(args: {
  close: () => void,
}): JSX.Element;

export declare type Coordinates = {
  top: number,
  left: number,
};
