/* eslint-disable @typescript-eslint/no-unnecessary-template-expression */
import { TypedEvents } from 'events-constructor';

export enum EEvent {
  CAM_ENABLE = 'cam:enable',
  CAM_DISABLE = 'cam:disable',
  MIC_ENABLE = 'mic:enable',
  MIC_DISABLE = 'mic:disable',
}

export const EVENT_NAMES = [
  `${EEvent.CAM_ENABLE}`,
  `${EEvent.CAM_DISABLE}`,
  `${EEvent.MIC_ENABLE}`,
  `${EEvent.MIC_DISABLE}`,
] as const;

export type TState = {
  isEnabledCam: boolean;
  isEnabledMic: boolean;
};

export type TEventMap = {
  'cam:enable': TState;
  'cam:disable': TState;
  'mic:enable': TState;
  'mic:disable': TState;
};

export type TEvents = TypedEvents<TEventMap>;

export const createEvents = () => {
  return new TypedEvents<TEventMap>(EVENT_NAMES);
};
