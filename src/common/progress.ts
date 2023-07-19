import EventEmitter from 'events';

export const EVENT_PROGRESS = 'progress';

let eventEmitterInstance: EventEmitter;
let currentProgress: number;
let maxProgressValue: number;

export const setupProgressSubscriber = (maxValue?: number) => {
  eventEmitterInstance = new EventEmitter();
  currentProgress = 0;
  maxProgressValue = maxValue ?? 0;

  eventEmitterInstance.on(EVENT_PROGRESS, (message: string) => {
    currentProgress++;

    console.log(`[${currentProgress}${maxProgressValue > 0 ? ` / ${maxProgressValue}` : ''}] ${message}`);
  });
};

export const eventEmitter = () => eventEmitterInstance;
