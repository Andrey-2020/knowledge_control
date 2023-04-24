import { MARK_TYPES } from 'globalStore/constants';

/** Цвет текста в зависимости от оценки */
const MARK_TYPES_TEXT_TYPE = {
  [MARK_TYPES.FIVE]: 'success',
  [MARK_TYPES.FOUR]: 'secondary',
  [MARK_TYPES.THREE]: 'warning',
  [MARK_TYPES.UNSATISFACTORILY]: 'danger',
};

/**
 * Отображение задания вместе с предыдущими попытками сдачи
 */
export default function TaskView(args: {
  id: number,
  title: string,
  description: string,
  fileIds: number[],
}): JSX.Element;
