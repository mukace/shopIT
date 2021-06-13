const sgMail = require('@sendgrid/mail');

exports.sendEmail = async options => {
    // const transporter = nodemailer.createTransport({
    //     service: process.env.EMAIL_SERVICE,
    //     auth: {
    //         type: 'OAuth2',
    //         user: process.env.EMAIL_USER,
    //         pass: process.env.EMAIL_PASS,
    //         clientId: process.env.OAUTH_CLIENTID,
    //         clientSecret: process.env.OAUTH_CLIENT_SECRET,
    //         refreshToken: process.env.OAUTH_REFRESH_TOKEN
    //     }
    // });
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const mailDetails = {
        to: options.email,
        from: `SHOPIT <${process.env.EMAIL_USER}>`,
        subject: options.subject,
        text: options.message
    }

    await sgMail.send(mailDetails);
}