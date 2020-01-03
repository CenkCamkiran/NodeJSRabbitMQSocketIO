#!/usr/bin/env node
"use strict";
const nodemailer = require("nodemailer");
var amqp = require('amqplib/callback_api');

async function main(textMessage) { //email göndermek için kullanıcaz
 // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email", //smtp.gmail.com
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass // generated ethereal password
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: "bar@example.com, baz@example.com", // list of receivers. you can emails as much as you wantkp
      subject: "Hello ✔", // Subject line
      text: textMessage,
      html: 'Embedded image: <img src="cid:unique@kreata.ee"/>',
      attachments: [{ //burası da resim eklemeye yarıyor.
        filename: 'picture.jpg',
        path: 'C:/Users/cenk.camkiran/Desktop/Nodejs RabbitMQ/picture.jpg', //give the full path to the file
        cid: 'unique@kreata.ee' //same cid value as in the html img src
    }]
      // plain text body
      //html: "<b>Hello world?</b>" // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

  }

  /*var email_options = {
        from: "cenkcamkiran@gmail.com",
        to: "cenkcamkiran01@gmail.com",
        subject: "Nodemail Test Mail",
        text: "Nodemail Test",
        //html: "<p>Cenk!!!???</p>"
    };*/

    /*transporter.sendMail(email_options, function(error, info){
        if (error)
        {
            console.log(error);
        } else {
            console.log("Email Successfully sent  -----  " + email_options.response);
        }
    });*/
  

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'RabbitMQ_Email';

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
            main(msg.content.toString()).catch(console.error);
        }, {
            noAck: true //bu kodla mesajları almaya başlayacaksın
        });
    });
});