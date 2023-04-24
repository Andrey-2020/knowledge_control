export default class BaseState {
  props = null;
  cancelableRequests = {
    componentUid: null,
    cancelRequest: null,
  };
  history = null;
  formInstance = null;
}
