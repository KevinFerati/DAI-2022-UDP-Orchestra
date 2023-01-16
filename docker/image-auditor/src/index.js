const mainConfig = require('../../config.json');
const auditorConfig = require('./auditor_config.json');
const net = require('net');
const dgram = require('dgram');

class Musician {
    constructor(uuid, sound) {
      this.uuid = uuid;
      this.instrument = ""
      // looking for the instrument making the given sound
      for (const [key, value] of Object.entries(mainConfig.instruments)) {
        if(value === sound) {
            this.instrument = key;
            break;
        }
      }
      // setting up the date
      this.activeSince = new Date();
    }
    updateDate() {
        this.activeSince = new Date();
    }
}

let orchestra = [];

function init() {
  startUDPSubscribtion();
  startTCPStream();
}

// UDP subscription to the orchestra
function startUDPSubscribtion() {
  const socket = dgram.createSocket('udp4');
  socket.bind(mainConfig.musicianToListenerProtocol.port, function() {
    console.log('joining multicast group');
    socket.addMembership(mainConfig.musicianToListenerProtocol.adress);
  });

  socket.on('message', function(msg, source) {
    console.log('message ! ');
    console.log(msg.toString());
    if(msg.uuid && msg.sound) {
      console.log('uuid is found');
      const musician = orchestra.find(element => element.uuid == msg.uuid);
      if((orchestra.length > 0) && (orchestra.find(element => element.uuid == msg.uuid) != undefined)) {
        // le musicien a déjà envoyé un message on met à jour la date
        console.log('musician has been found');
        musician.updateDate();
      } else {
        console.log('musician has been added');
        // le musicien n'a encore rien envoyé on l'ajoute
        orchestra.push(new Musician(msg.uuid, msg.sound));
      }
    }
  });
}
// TODO

// TCP server to publish the info
function startTCPStream() {
  const server = new net.Server();
  server.listen(auditorConfig.TCPServerPort, function() {
    console.log(`server is listening ! Port: ${server.address().port} , address: ${server.address().address}`);
  });

  server.on('connection', function(socket) {
    console.log('a client is connected !');

    // when a client is connected : directly send the orchestra info
    socket.write(JSON.stringify(orchestra) + "\n");
    
    // emit the data only once - Half-close the socket
    socket.end();

    socket.on('end', function() {
      console.log('closing connection');
    });

    socket.on('error', function(error) {
      console.log(`Error : ${error}`);
    });
  });
}

init();