import { BooleanState } from 'plugins/mobx/fields';


export interface Props {
  visible: BooleanState;
  comment: string;
  updateComment(comment: string): void;
  mostPopularComments: [];
}

export default function VisitCommentModal(props: Props): JSX.Element;
