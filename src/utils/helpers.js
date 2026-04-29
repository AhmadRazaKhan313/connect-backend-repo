const { PAYMENT_METHODS } = require("./Constants");

const generatePassword = () => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0, n = charset.length; i < process.env.PASSWORD_LENGTH; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

const getPaymentMethodNameByKey = (key) => {
  return PAYMENT_METHODS.find((item) => item.key === key).value;
};

const getEmailFormatForPackageExpiry = (name, userid, vlan, date) => {
  return `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title></title>
    <style>
      table, td, div, h1, p {font-family: Arial, sans-serif;}
    </style>
  </head>
  <body style="margin:0;padding:0;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
            <tr>
              <td align="center" style="padding:40px 0 30px 0;background:#70bbd9;">
                <img src="https://www.connect.net.pk/images/logo/connect-logo-original.png" alt="" width="300" style="height:auto;display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:36px 30px 42px 30px;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                  <tr>
                    <td style="padding:0 0 36px 0;color:#153643;">
                      <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">Package Expiry</h1>
                      <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Dear <span style="font-weight:bold">${name}</span>, Your User ID <span style="font-weight:bold">${userid}</span>, <span style="font-weight:bold">VLAN-${vlan}</span> Will Expire On ${date}. For next recharge <br>Call: 03349000873<br>Whatsapp: 03005592282.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;background:#ee4c50;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                  <tr>
                    <td style="padding:0;width:50%;" align="left">
                      <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;">
                        &copy; Connect Communication Lodrhan ${new Date().getFullYear()}<br/><a href="https://www.connectcommunicationsLodhran.com" target="blank" style="color:#ffffff;text-decoration:underline;">Visit Our Website</a>
                      </p>
                    </td>
                    <td style="padding:0;width:50%;" align="right">
                      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                        <tr>
                          <td style="padding:0 0 0 10px;width:38px;">
                            <a href="http://www.twitter.com/" style="color:#ffffff;"><img src="https://www.connect.net.pk/images/logo/connect-logo-original.png" alt="Twitter" width="200" height="50" style="height:auto;display:block;border:0;" /></a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

const getEmailFormat = (title, message) => {
  return `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title></title>
    <style>
      table, td, div, h1, p {font-family: Arial, sans-serif;}
    </style>
  </head>
  <body style="margin:0;padding:0;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
            <tr>
              <td align="center" style="padding:40px 0 30px 0;background:#70bbd9;">
                <img src="https://www.connect.net.pk/images/logo/connect-logo-original.png" alt="" width="300" style="height:auto;display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:36px 30px 42px 30px;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                  <tr>
                    <td style="padding:0 0 36px 0;color:#153643;">
                      <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">${title}</h1>
                      <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">${message}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;background:#ee4c50;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                  <tr>
                    <td style="padding:0;width:50%;" align="left">
                      <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;">
                        &copy; Connect Communication Lodrhan ${new Date().getFullYear()}<br/><a href="https://www.connectcommunicationsLodhran.com" target="blank" style="color:#ffffff;text-decoration:underline;">Visit Our Website</a>
                      </p>
                    </td>
                    <td style="padding:0;width:50%;" align="right">
                      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                        <tr>
                          <td style="padding:0 0 0 10px;width:38px;">
                            <a href="http://www.twitter.com/" style="color:#ffffff;"><img src="https://www.connect.net.pk/images/logo/connect-logo-original.png" alt="Twitter" width="200" height="50" style="height:auto;display:block;border:0;" /></a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

const getSMSFormatForPackageExpiry = (name, userid, vlan, date) => {
  return `Dear ${name}, Your User ID ${userid} VLAN-${vlan} Will Expire On ${date}. For next recharge Call 03349000873. 03005592282 (Whatsapp-only).`;
};

const getTomorrowDate = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = tomorrow.getMonth() + 1;
  const day = tomorrow.getDate();
  const tomorrowDate = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;

  return tomorrowDate;
};

const getDaysBetweenDates = (date1, date2) => {
  const oneDay = 1000 * 60 * 60 * 24; // milliseconds in a day
  const diffMilliseconds = Math.abs(date1 - date2); // difference in milliseconds
  const diffDays = Math.floor(diffMilliseconds / oneDay); // difference in days
  return diffDays;
};

function getLastDayOfMonth(year, month) {
  const dateTo = new Date(year, month, 1); // Set the day to 1 to get the first day of the month
  dateTo.setMonth(dateTo.getMonth()); // Increment the month by 1 to get the first day of the next month
  dateTo.setDate(dateTo.getDate() - 1); // Subtract 1 day to get the last day of the original month
  return dateTo.getDate();
}

function getFirstAndLastDate(month, year) {
  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0);

  const options = { timeZone: 'Asia/Karachi' };
  const firstDateString = firstDate.toLocaleDateString('en-US', options);
  const lastDateString = lastDate.toLocaleDateString('en-US', options);

  const [month1, day1, year1] = firstDateString.split("/");
  const [month2, day2, year2] = lastDateString.split("/");

  const dateFrom = new Date(Date.UTC(year1, month1-1, day1)).toISOString();
  const dateTo = new Date(Date.UTC(year2, month2-1, day2)).toISOString();

  return {
    dateFrom: new Date(dateFrom), dateTo: new Date(dateTo)
  };
}

module.exports = {
  generatePassword,
  getPaymentMethodNameByKey,
  getEmailFormatForPackageExpiry,
  getTomorrowDate,
  getSMSFormatForPackageExpiry,
  getEmailFormat,
  getDaysBetweenDates,
  getLastDayOfMonth,
  getFirstAndLastDate
};
