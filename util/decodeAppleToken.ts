import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

const APPLE_BASE_URL = 'https://appleid.apple.com';

export const getApplePublicKey = async (kid) => {
  const client = jwksClient({
    cache: true,
    jwksUri: `${APPLE_BASE_URL}/auth/keys`,
  });
  const key: any = await new Promise((resolve, reject) => {
    client.getSigningKey(kid, (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
  return key.publicKey as jwksClient.CertSigningKey || key.rsaPublicKey as jwksClient.RsaSigningKey;
};

export default async (idToken: string, clientId?: string) => {
  const decoded = jwt.decode(idToken, { complete: true });

  const kid = _.get(decoded, 'header.kid');
  const alg = _.get(decoded, 'header.alg');

  const applePublicKey = await getApplePublicKey(kid);

  // @ts-ignore
  const jwtClaims = jwt.verify(idToken, applePublicKey, { algorithms: [alg] });

  const aud = _.get(jwtClaims, 'aud');

  if (clientId && aud !== clientId) {
    throw new Error(`The aud parameter does not include this client - is: ${aud} | expected: ${clientId}`);
  }

  return jwtClaims;
};
