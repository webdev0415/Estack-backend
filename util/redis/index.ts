/** redis client */
// tslint:disable-next-line: no-var-requires
const redis = require('redis');

/** promise lib */
// tslint:disable-next-line: no-var-requires
const bluebird = require('bluebird');
import config from '../../config';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export default redis.createClient({
  url: config.redis.url,
  password: config.redis.password,
});
