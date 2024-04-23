import nodemailer from 'nodemailer';

function sendEmail(to : string, subject : string, body : string, myEmail : string, myPassword : string) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: myEmail, // replace with your actual email address
            pass: myPassword // replace with your actual password
        }
    });
  
    // read the attachment file  
    // setup email data with unicode symbols
    let mailOptions = {
        from: myEmail, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: body, // plain text body
        html: `<p>${body}</p>`, // html body
        attachments: []
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
  }

export { sendEmail };