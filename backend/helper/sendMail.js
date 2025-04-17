require("dotenv").config();
// sending mail using API keys
const brevo = require("@getbrevo/brevo");

// For sending mail using SMTP server
// const smtpServer = process.env.SMTP_SERVER; //smtp server
// const smtpPort = process.env.SMTP_PORT; // port
// const smtpPass = process.env.SMTP_PASS; //password
const smtpUser = process.env.SMTP_USER || process.env.DEFAULT_ADMIN_EMAIL; // sender email
const apiKey_VALUE = process.env.BREVO_API_KEY;
const senderUserName = "LNMIIT Alumni Connect";

let defaultClient = brevo.ApiClient.instance;

let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = apiKey_VALUE;

let apiInstance = new brevo.TransactionalEmailsApi();
let sendSmtpEmail = new brevo.SendSmtpEmail();

//  this mail is going to be sent User who newly registered
const emailNewUser = async (email, userName, adminEmail, batchAdminEmail) => {
  try {
    if (!apiKey_VALUE) {
      console.error("BREVO_API_KEY is not set in environment variables");
      return false;
    }

    sendSmtpEmail.subject = "Welcome to LNMIIT Alumni Connect";
    sendSmtpEmail.htmlContent = `
    <html>
        <body>
            <p>
                Dear ${userName}, 
                thank you for registering to LNMIIT Alumni Connect. Complete your profile by updating your other profile details by clicking on the profile icon.
                We will let you know when Our admin verify your account.
                <br />
                You can get all study materials & including question, notices in our community website. You can also better learn about your classmates, seniors & juniors as well there.
                <br />
                Happy coding :)
                Have good day!
            </p>
            <br />
            <p>
            Learn more about us at <a href="https://lnmiit.ac.in">LNMIIT</a>
            </p>
        </body>
    </html>`;
    sendSmtpEmail.sender = {
      name: senderUserName,
      email: smtpUser,
    };
    sendSmtpEmail.to = [
      {
        email: email,
        name: userName,
      },
    ];
    sendSmtpEmail.headers = { "create account email": email };
    sendSmtpEmail.params = {
      parameter: "Send email to user.",
      subject: "New account created!",
    };
    const { messageId } = await apiInstance.sendTransacEmail(sendSmtpEmail);
    if (!messageId) {
      console.error("Failed to send email: No messageId returned");
      return false;
    }
    console.log(
      `Email sent successfully to ${email} with messageId: ${messageId}`
    );
    return true;
  } catch (error) {
    console.error("Error in emailNewUser function:", error);
    return false;
  }
};

// email user when one user account get verified
const sendAccountVerifiedMail = async (email, userName) => {
  try {
    if (!apiKey_VALUE) {
      console.error("BREVO_API_KEY is not set in environment variables");
      return false;
    }

    sendSmtpEmail.subject = "Account Verified - LNMIIT Alumni Connect";
    sendSmtpEmail.htmlContent = `
    <html>
        <body>
            <p>
                Dear ${userName}, 
                Congratulations! You are now a verified member of LNMIIT Alumni Connect. Thank you for being part of our community.
                <br />
                You can get all study materials & including question, notices in our community website. You can also better learn about your classmates, seniors & juniors as well there.
                <br />
                Happy coding :)
                Have good day!
            </p>
            <br />
            <p>
              Learn more about us at <a href="https://lnmiit.ac.in">LNMIIT</a>
            </p>
        </body>
    </html>
    `;
    sendSmtpEmail.sender = {
      name: senderUserName,
      email: smtpUser,
    };
    sendSmtpEmail.to = [
      {
        email: email,
        name: userName,
      },
    ];

    sendSmtpEmail.headers = { "Account verified": email };
    sendSmtpEmail.params = {
      parameter: "Send email to user.",
      subject: "Account verified!",
    };
    const { messageId } = await apiInstance.sendTransacEmail(sendSmtpEmail);
    if (!messageId) {
      console.error("Failed to send verification email: No messageId returned");
      return false;
    }
    console.log(
      `Verification email sent successfully to ${email} with messageId: ${messageId}`
    );
    return true;
  } catch (error) {
    console.error("Error in sendAccountVerifiedMail function:", error);
    return false;
  }
};

// email admin when a new user registers for the first time
const emailAdminNewUserRegistered = async (adminEmail, userDetails) => {
  try {
    if (!apiKey_VALUE) {
      console.error("BREVO_API_KEY is not set in environment variables");
      return false;
    }

    const { batch, email, name } = userDetails;
    sendSmtpEmail.subject = "New User Registration - LNMIIT Alumni Connect";
    sendSmtpEmail.htmlContent = `
    <html>
        <body>
            <p>
                Dear Admin, 
                A new user has registered on LNMIIT Alumni Connect with the following details:
            </p>
            <br />
            <p>
              Name : ${name} <br/>
              Email : ${email} <br/>
              Batch : ${batch} 
            </p>
            <br />
            <p>
              Please verify the user at your earliest convenience.
            </p>
        </body>
    </html> 
    `;
    sendSmtpEmail.sender = {
      name: senderUserName,
      email: smtpUser,
    };
    sendSmtpEmail.to = [
      {
        email: adminEmail,
        name: "Admin",
      },
    ];
    sendSmtpEmail.headers = { "New user": email };
    sendSmtpEmail.params = {
      parameter: "Notify email to Admin.",
      subject: "New user registered!",
    };
    const { messageId } = await apiInstance.sendTransacEmail(sendSmtpEmail);
    if (!messageId) {
      console.error(
        "Failed to send admin notification email: No messageId returned"
      );
      return false;
    }
    console.log(
      `Admin notification email sent successfully to ${adminEmail} with messageId: ${messageId}`
    );
    return true;
  } catch (error) {
    console.error("Error in emailAdminNewUserRegistered function:", error);
    return false;
  }
};

module.exports = {
  emailNewUser,
  sendAccountVerifiedMail,
  emailAdminNewUserRegistered,
};
