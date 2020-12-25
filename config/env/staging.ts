/** Env spicific config */
module.exports = {
  http: {
    port: process.env.PORT || 8000,
  },
  coupon: {
    lifeTimeH: 240,
    confirmTimeH: 24,
  },
  morganFormat: ':remote-addr - :method :url - [:status] (:res[content-length]b sent in :response-time ms)',
  jwtSecret: 'secretKey',
  jwtExpire: {
    accessTokenSec: '7200', // two hours
    refreshTokenSec: '15552000', // half year
    posInviteSec: '2592000', // one month
  },
  mongo_url: 'mongodb+srv://estackk:mongo6789@cluster0-bcjgq.mongodb.net/estackk?retryWrites=true&w=majority',
  redis: {
    name: 'estackk',
    url: '//redis-16350.c85.us-east-1-2.ec2.cloud.redislabs.com:16350',
    password: 'p4PfRMsqbDfHtex0F43845LcRFTUfMv7',
  },
  timeSchedule: '0 6 * * *', // daily at 6:00 AM
  cron: {
    name: 'cron:estackk-schedule',
    redis: {
      host: 'redis-16350.c85.us-east-1-2.ec2.cloud.redislabs.com',
      port: 16350,
      password: 'p4PfRMsqbDfHtex0F43845LcRFTUfMv7',
    },
  },
  awsConfig: {
    bucket: 'loyalty-app-bucket',
    region: 'us-east-1',
    acl: 'private',
    accessKeyId: 'AKIAJN2TG3CJM5CKIQZQ',
    secretAccessKey: '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',
  },
  mail: {
    data: {
      from: 'support@estackk.com',
      defaultEmail: 'abhay@estackk.com',
      resetPassword: {
        subject: 'Reset Password',
      },
      posRegistration: {
        subject: 'Invitation',
      },
      subscriptionChanges: {
        subject: 'Changing subscription cost',
      },
      successPayment: {
        subject: 'Success payment',
      },
      subscriptionBegins: {
        subject: 'Subscription begins',
      },
      subscriptionStopped: {
        subject: 'Subscription stopped',
      },
    },
  },
  subscription: {
    trialDuration: 2592000000, // 30 d
    monthlySubscriptionDuration: 2592000000, // 30 d
    yearlySubscriptionDuration: 31104000000, // 360 d
    notifyAtForTrial: 604800000, // 7 d
    notifyAtForMountPayment: 604800000, // 7 d
    notifyAtForMountYear: 2592000000, // 30 d
    boutique: {
      monthlyPrice: 80,
      yearlyPrice: 960,
    },
    enterprise: {
      monthlyPrice: 50,
      yearlyPrice: 600,
    },
    grace: 30, // days
  },
  appLinks: {
    iosStoreLink: 'https://itunes.apple.com/us/app/aweshome/id1439355184?mt=8',
    playStoreLink: 'https://market.android.com/details?id=com.aweshome',
    androidPackageName: 'com.aweshome',
    fallback: 'https://www.estackk.com/',
    apiLink: 'http://134.249.227.172:8000',
    mobPosLink: 'estackk-pos-app://estackk',
    deepLink: 'pos/deep-link',
  },
  stripe: {
    secretKey: 'sk_test_7CHDS9YEutdGlYy4K7uWWZCR00eZcQETy3',
  },
  customersNumThreshold: 100,
};
