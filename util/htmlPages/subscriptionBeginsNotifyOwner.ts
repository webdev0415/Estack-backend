export const subscriptionBeginsNotifyOwner = (email) => (
  `
<!DOCTYPE html>
<html lang="en">
<link href="https://fonts.googleapis.com/css?family=Montserrat&display=swap" rel="stylesheet">
<body style="margin:0 auto; padding:0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;">
<div
        style="width: 640px; background: white; text-align: center; padding: 36px;"
>
    <span style="font-style: normal; font-weight: normal; font-size: 18px; line-height: 27px; letter-spacing: -0.01em; font-family: 'Montserrat', sans-serif;">
        The merchant with email ${email} has reached 100 customers.
    </span>
</div>
</body>
</html>
  `
);
