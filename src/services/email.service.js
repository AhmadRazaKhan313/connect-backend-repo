const nodemailer = require("nodemailer");
const xml2js = require("xml2js");
const { SmsSendingModel } = require("../models");
const AWS = require("aws-sdk");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_VENDOR_ID = process.env.WHATSAPP_VENDOR_ID
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN

// Configure AWS SDK with your credentials
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // e.g., 'us-west-2'
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

const transportInfo = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // set this to false if your SMTP server does not support SSL/TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: `"Connect Lodhran" <${process.env.SMTP_USER_INFO}>`,
});

const transportInvoice = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // set this to false if your SMTP server does not support SSL/TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: `"Connect Lodhran" <${process.env.SMTP_USER_INVOICE}>`,
});

const transportReminder = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // set this to false if your SMTP server does not support SSL/TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: `"Connect Lodhran" <${process.env.SMTP_USER_REMINDER}>`,
});

const SendGridApi = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SendGridApi);

const sendEmailByInfo = async (to, subject, html, ccc) => {
  const msg = {
    to,
    from: "Connect Lodhran <sheikhzain01@gmail.com>", // Use the email address or domain you verified with SendGrid
    subject,
    html,
  };

  // Send the email
  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
    console.log("Error sending email");
  }
};

const sendEmailByInvoice = (to, subject, html, ccc) => {
  const message = {
    from: `Connect Lodhran <${process.env.SMTP_USER_INVOICE}`,
    to,
    cc: ccc ? "connectlodhran@gmail.com" : "",
    subject,
    html,
  };

  transportInvoice.sendMail(message, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const sendEmailByReminder = (to, subject, html, ccc) => {
  const message = {
    from: `Connect Lodhran <${process.env.SMTP_USER_REMINDER}`,
    to,
    cc: ccc ? "connectlodhran@gmail.com" : "",
    subject,
    html,
  };

  transportReminder.sendMail(message, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      console.log("kjnn")
    }
  });
};

// const sendTemplateForExpiry = async (phone_number, user, id, vlan, date) => {
//   try {
//     await axios.post(
//       `${WHATSAPP_API_URL}/${WHATSAPP_VENDOR_ID}/contact/send-template-message`,
//       {
//         phone_number,
//         template_name: "reminder_recharge_2",
//         template_language: "en",

//         // template variables
//         field_1: user,
//         field_2: id,
//         field_3: vlan,
//         field_4: date
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     return Promise.resolve(
//       `SMS Sent successfully to: ${phone_number} at ${new Date().toISOString()}`
//     );
//   } catch (err) {
//     return Promise.reject(
//       `SMS Error for ${phone_number} at ${new Date().toISOString()} : ${err.message
//       }`
//     );
//   }
// };

const sendTemplateForExpiry = async (phone_number, user, id, vlan, date) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_VENDOR_ID}/contact/send-template-message`,
      {
        phone_number,
        template_name: "reminder_recharge_2",
        template_language: "en",
        field_1: user,
        field_2: id,
        field_3: vlan,
        field_4: date
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ SUCCESS:", phone_number, response.data);
    return Promise.resolve(
      `SMS Sent successfully to: ${phone_number} at ${new Date().toISOString()}`
    );
  } catch (err) {
    console.log(
      "❌ FAILED:",
      phone_number,
      err.response?.data || err.message
    );
    return Promise.reject(
      `SMS Error for ${phone_number} at ${new Date().toISOString()} : ${err.message
      }`
    );
  }
};

const sendTemplateForWelcome = async (phone_number, user, id) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_VENDOR_ID}/contact/send-template-message`,
      {
        phone_number,
        template_name: "welcome_1",
        template_language: "en",

        // template variables
        field_1: user,
        field_2: id
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ SUCCESS:", phone_number, response.data);

    return Promise.resolve(
      `SMS Sent successfully to: ${phone_number} at ${new Date().toISOString()}`
    );
  } catch (err) {
    console.log(
      "❌ FAILED:",
      phone_number,
      err.response?.data || err.message
    );
  }
};

const sendTemplateForEntryPayment = async (phone_number, user, id, vlan, tid, date) => {
  try {
    await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_VENDOR_ID}/contact/send-template-message`,
      {
        phone_number,
        template_name: "package_activated_1",
        template_language: "en",

        // template variables
        field_1: user,
        field_2: id,
        field_3: vlan,
        field_4: tid,
        field_5: date,
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return Promise.resolve(
      `SMS Sent successfully to: ${phone_number} at ${new Date().toISOString()}`
    );
  } catch (err) {
    console.log({ err })
    return Promise.reject(
      `SMS Error for ${phone_number} at ${new Date().toISOString()} : ${err.message
      }`
    );
  }
};

const sendSms = async (phone, message) => {
  // await sendWhatsappMessage(phone, message);
  // try {
  //   const response = await axios.get(
  //     "http://outreach.pk/api/sendsms.php/sendsms/url",
  //     {
  //       params: {
  //         id: "rchconnectldr",
  //         pass: "zain@2265",
  //         mask: "CONNECT-LDR",
  //         to: phone,
  //         lang: "English",
  //         msg: message,
  //         type: "xml",
  //       },
  //       headers: {
  //         "Cache-Control": "no-cache",
  //         Pragma: "no-cache",
  //       },
  //     }
  //   );
  //   if (response.status === 200) {
  //     return Promise.resolve(
  //       `SMS Sent successfully to: ${phone} at ${new Date().toISOString()}`
  //     );
  //   } else {
  //     return Promise.reject(
  //       `Failed to send SMS to: ${phone} at ${new Date().toISOString()}, response status: ${
  //         response.status
  //       }`
  //     );
  //   }
  // } catch (err) {
  //   return Promise.reject(
  //     `SMS Error for ${phone} at ${new Date().toISOString()} : ${
  //       err.message
  //     }`
  //   );
  // }
};

const getSmsBalance = async () => {
  return new Promise((resolve, reject) => {
    fetch(
      "http://outreach.pk/api/sendsms.php/balance/status?id=rchconnectldr&pass=zain@2265"
    )
      .then((res) => res.text())
      .then((xmlString) => {
        xml2js.parseString(xmlString, (error, result) => {
          if (error) {
            resolve(0);
          } else {
            const responseValue = result.balance.corpsms.reduce(
              (acc, item) => (acc += +item.response[0]),
              0
            );
            resolve(responseValue);
          }
        });
      })
      .catch((err) => {
        resolve(0);
      });
  });
};

const sendWhatsappMessage = async (phone, message) => {
  try {
    const response = await axios.get(
      "https://wa.systemsmit.com/api/create-message",
      {
        params: {
          appkey: "114c1f90-f169-4e13-96f1-e06fb3b5f818",
          authkey: "gYqqkC9R7J28FG3pXntzWFoDSojO3WtvkYCvx5sdBjhn9Whq6B",
          to: phone,
          message
        },
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );
    if (response.status === 200) {
      return Promise.resolve(
        `Whatsapp Message Sent successfully to: ${phone} at ${new Date().toISOString()}`
      );
    } else {
      return Promise.reject(
        `Failed to send Whatsapp Message to: ${phone} at ${new Date().toISOString()}, response status: ${response.status
        }`
      );
    }
  } catch (err) {
    return Promise.reject(
      `Whatsapp Message Error for ${phone} at ${new Date().toISOString()} : ${err.message
      }`
    );
  }
};

module.exports = {
  sendEmailByInfo,
  sendEmailByInvoice,
  sendEmailByReminder,
  sendSms,
  getSmsBalance,
  sendWhatsappMessage,
  sendTemplateForExpiry,
  sendTemplateForWelcome,
  sendTemplateForEntryPayment
};
