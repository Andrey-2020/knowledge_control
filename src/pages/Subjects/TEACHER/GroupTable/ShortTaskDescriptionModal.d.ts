import React, { useState } from 'react';


import { Task } from 'DBModels';

export interface Props {
  task: Task;
}

export default function ShortTaskDescriptionModal(props: Props): JSX.Element;
