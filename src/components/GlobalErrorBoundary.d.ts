import React from 'react';

/**
 * Предохранитель на случай ошибки в любой части приложения
 * (так как других предохранителей нет)
 */
export default class GlobalErrorBoundary extends React.Component {
  constructor(props: { children: JSX.Element | JSX.Element[] });

  static getDerivedStateFromError(error: Error): { error: Error };

  copyError(): void;

  copyEmail(): void;

  render(): JSX.Element;
}