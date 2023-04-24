export default function getFullName(
  firstName?: string,
  lastName?: string,
  patronymic?: string,
  incognita: string,
): string;

export function getFullNameFromObject(
  object: {
    firstName?: string,
    lastName?: string,
    patronymic?: string,
  },
  incognita: string,
): string;
