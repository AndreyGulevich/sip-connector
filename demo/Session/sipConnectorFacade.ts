import JsSIP from '@krivega/jssip';

import { SipConnector, SipConnectorFacade, enableDebug } from '@/index';

enableDebug();

const sipConnector = new SipConnector({
  JsSIP,
});
const sipConnectorFacade = new SipConnectorFacade(sipConnector);

export default sipConnectorFacade;
