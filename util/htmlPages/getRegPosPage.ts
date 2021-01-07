import * as _ from 'lodash';
import config from '../../config';

export const getRegPosPage = (token) => (
  `
<!DOCTYPE html>
<html lang="en">
<link href="https://fonts.googleapis.com/css?family=Montserrat&display=swap" rel="stylesheet">
<body style="margin:0 auto; padding:0;">
  <div
    style="width: 640px; background: white; text-align: center; padding: 36px;"
  >
    <span style="font-family: 'Montserrat', sans-serif; font-style: normal; font-weight: bold; font-size: 30px; line-height: 37px; letter-spacing: -0.01em;">You're almost there</span>
    <br>
    <span style="font-style: normal; font-weight: normal; font-size: 18px; line-height: 27px; letter-spacing: -0.01em; font-family: 'Montserrat', sans-serif;">Thank you for registration with us. Activate your account clicking on the button bellow.</span>
    <br>
    <div style="display: inline-block;">
      <a href="${config.appLinks.apiLink}/${config.appLinks.deepLink}/${_.replace(`${config.appLinks.mobPosLink}/${token}`, /\//g, '@@')}" style="cursor: pointer; border: 2px solid black; text-align: center; padding: 12px 36px; font-weight: bold; margin: 24px; font-family: 'Montserrat', sans-serif; cursor: pointer; display: block; color: black; text-decoration: none;">Activate account</a>
    </div>
  </div>
</body>
</html>
  `
);
