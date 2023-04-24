import { Moment } from 'moment';


export interface FormData {
  title: string;
  actionTypeId: number | string;
  actionDate: Moment;
  description: string;
}

export default function AddAction(): JSX.Element;
