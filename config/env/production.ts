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
    regCustomerCodeSec: '3600',
  },
  emailVerificationCodeExpireSec: '3600',
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
    accessKeyId: 'AKIAILMZMWTTA5XOR6GA',
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
    androidPackageName: 'com.boilerplate',
    fallback: 'https://www.estackk.com/',
    apiLink: 'http://estackk-api-lb-925393001.ap-southeast-1.elb.amazonaws.com',
    mobPosLink: 'estackk-pos-app://estackk',
    deepLink: 'pos/deep-link',
  },
  stripe: {
    secretKey: 'sk_live_dEfRhKgkFPKYq8DmlFW3KSzy00XLyAdrTy',
  },
  customersNumThreshold: 100,
};
