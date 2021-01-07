import config from '../../config';

export const genOpenTheAppPage = (link) =>  `
  <script>
   window.onload = deepLink;

const urls = {
  deepLink: '${link}',
  iosStoreLink: '${config.appLinks.iosStoreLink}',
  playStoreLink: '${config.appLinks.playStoreLink}',
  fallback: '${config.appLinks.fallback}',
};

function deepLink(isFallbackNeed = false) {
  setTimeout(() => {
    const ua = window.navigator.userAgent;

    // split the first :// from the url string
    const split = urls.deepLink.split(/:\\/\\/(.+)/);
    const scheme = split[0];
    const path = split[1] || '';
    const androidIntent = 'intent://' + path + '#Intent;scheme=' + scheme + ';package=${config.appLinks.androidPackageName};end;';

    const isMobile = {
      android: () => /Android/i.test(ua),
      ios: () => /iPhone|iPad|iPod/i.test(ua),
    };

    function launchWebkitApproach(url, fallback) {
      window.location = url;
      setTimeout(() => {
        window.location = fallback;
      }, 2500);
    }

    function launchIframeApproach(url, fallback) {
      const iframe = document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.onload = () => {
        document.location = url;
        window.location = url;
      };
      iframe.src = url;

      window.onload = () => {
        document.body.appendChild(iframe);

        setTimeout(() => {
          window.location = fallback;
        }, 2500);
      };
    }

    function iosLaunch() {
      // chrome and safari on ios >= 9 don't allow the iframe approach
      if (ua.match(/CriOS/) || (ua.match(/Safari/) && ua.match(/Version\\/(9|10)/))) {
        launchWebkitApproach(urls.deepLink, urls.iosStoreLink || urls.fallback);
      } else {
        launchIframeApproach(urls.deepLink, urls.iosStoreLink || urls.fallback);
      }
    }

    function androidLaunch() {
      if (ua.match(/Chrome/)) {
        document.location = androidIntent;
      } else if (ua.match(/Firefox/)) {
        launchWebkitApproach(urls.deepLink, urls.playStoreLink || urls.fallback);
      } else {
        launchIframeApproach(urls.deepLink, urls.playStoreLink || urls.fallback);
      }
    }
    if (isMobile.ios() ) {
      return iosLaunch();
    }

    if (isMobile.android()) {
      return androidLaunch();
    }

    if (isFallbackNeed === true) {
      return launchWebkitApproach(urls.deepLink, urls.fallback);
    }

  })
}
  </script>
  <style>
  a {
    font-family: initial;
    background-color: #4c7dff;
    font-size: 3.75em;
    color: white;
    padding: 1rem 1.5rem;
    text-decoration: none;
    text-transform: uppercase;
  }

  a:hover {
    background-color: #0e61ff;
  }

  a:active {
    background-color: black;
  }

  a:visited {
    background-color: #ccc;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  </style>
  <body>
    <a href="${link}" onclick="deepLink(true)">Open the APP</a>
  </body>
`;
