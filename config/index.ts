import * as nconf from 'nconf';
import * as _ from 'lodash';
import { staticConfig } from './static/config';

nconf.env().argv();

/**
 * depending on
 * @param {string} NODE_ENV - evironment
 * exports config
 */
const environment = nconf.get('NODE_ENV') || 'development';
export default _.extend(
  {
    environment,
  },
  staticConfig,
  // tslint:disable-next-line: no-var-requires
  require(`${__dirname}/env/${environment}`),
  nconf.get(),
);
