import type SipConnector from '../../../SipConnector';
import doMockSIPconnector from '../../../__fixtures__/doMock';
import resolveOnStartMic from '../../syncMediaState/resolveOnStartMic';

describe('media state: resolveOnStartMic', () => {
  let sipConnector: SipConnector;
  let handlerOnStartMic: jest.Mock<void, any>;
  let onStartMic: ReturnType<typeof resolveOnStartMic>;
  let offStartMic: () => void;

  const syncModeForced = { isSyncForced: true };
  const syncModeNotForced = { isSyncForced: false };

  beforeEach(() => {
    sipConnector = doMockSIPconnector();
    handlerOnStartMic = jest.fn();

    onStartMic = resolveOnStartMic(sipConnector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('#1 should subscribe media event and call handler on event trigger', () => {
    expect.assertions(4);

    onStartMic(handlerOnStartMic);

    // @ts-ignore
    sipConnector._sessionEvents.trigger('admin-start-mic', syncModeForced);

    expect(handlerOnStartMic).toHaveBeenCalledTimes(1);
    expect(handlerOnStartMic).toHaveBeenCalledWith(syncModeForced);

    // @ts-ignore
    sipConnector._sessionEvents.trigger('admin-start-mic', syncModeNotForced);

    expect(handlerOnStartMic).toHaveBeenCalledTimes(2);
    expect(handlerOnStartMic).toHaveBeenCalledWith(syncModeNotForced);
  });

  it('#2 should unsubscribe media event', () => {
    expect.assertions(2);

    offStartMic = onStartMic(handlerOnStartMic);

    // @ts-ignore
    sipConnector._sessionEvents.trigger('admin-start-mic', syncModeForced);

    expect(handlerOnStartMic).toHaveBeenCalledTimes(1);

    offStartMic();

    // @ts-ignore
    sipConnector._sessionEvents.trigger('admin-start-mic', syncModeForced);

    expect(handlerOnStartMic).toHaveBeenCalledTimes(1);
  });
});
