
interface RemovableEventHandler {
  (e: Event, callback: () => void): void;
}

export default (eventType: string, handler: RemovableEventHandler, target: any = window): void => {
  function listener(e: Event) {
    const removeEventListener = () => target.removeEventListener(eventType, listener);
    handler(e, removeEventListener);
  }
  target.addEventListener(eventType, listener);
};
