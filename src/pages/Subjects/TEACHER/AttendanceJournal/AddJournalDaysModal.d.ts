import { User } from "DBModels";


export interface Props {
  disabled: boolean;
  students: User[];
  studyGroupId: number;
  subjectSemesterId: number;
  onJournalChanged(): void;
}

export default function AddJournalDaysModal(props: Props): JSX.Element;
