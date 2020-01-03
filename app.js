#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    console.log("Başarılı");//bağlantıya bak

    socket.on('cenk', function(data) {
      console.log(data); //mesajı bastırdık

      amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0; //rabbitMQ server'ına bağlancaz
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }//burayı da api kendi hallediyor. yani hata filan tespit etcek

        var queue = 'RabbitMQ_Email'; //queue yarattık.
        var msg = data; //mesajımız

        channel.assertQueue(queue, { //ilk önce queue oluşturmamız lazım.
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(msg)); //mesajı queue'a yolla

        console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() { //mesajı yolladıktan sonra connection kapancak
        connection.close();
        process.exit(0);
    }, 500);
});
    });

});

app.listen(3001);