import { History } from 'history';
import { FormInstance } from 'antd';

import { CancelableRequestsObject } from 'plugins/http/useCancelableRequests';


/**
 * Поля, которые есть у большинства объектов State
 */
export default class BaseState<Props> {
  props: Props;
  cancelableRequests: CancelableRequestsObject;
  history: History;
  formInstance: FormInstance;
}
