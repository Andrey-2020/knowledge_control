import { FlexMark } from 'DBModels';


export interface Props {
  target: FlexMark;
}

export interface FinalMarkData {
  done: number;
  total: number;
  mark: number;
}

export default function FlexMarkView(props: Props): JSX.Element;
