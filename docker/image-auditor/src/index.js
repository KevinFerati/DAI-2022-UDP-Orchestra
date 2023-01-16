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
  // start listening to the musicians
  startUDPSubscribtion();
  // start sending informations about the musicians
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
    console.log(`new message : ${msg.toString()}`);
    const musicianInfo = msg.toString();

    const musician = orchestra.find(element => element.uuid == musicianInfo.uuid);
    if((orchestra.length > 0) && (orchestra.find(element => element.uuid == musicianInfo.uuid) != undefined)) {
      // musician has already sent something - change the last active datetime
      musician.updateDate();
    } else {
      // musician never said anything - add it
      orchestra.push(new Musician(musicianInfo.uuid, musicianInfo.sound));
    }
  });
}

// start TCP server to publish the orchestra info
function startTCPStream() {
  const server = new net.Server();
  server.listen(auditorConfig.TCPServerPort, function() {
    console.log(`server is listening ! Port: ${server.address().port} , address: ${server.address().address}`);
  });

  server.on('connection', function(socket) {
    console.log('a client is connected !');
    // when a client is connected : directly send the orchestra info
    const activeMusicians = orchestra.filter(element => {
      // getTime() = milliseconds /1000 for seconds
      ((element.activeSince.getTime() - new Date().getTime()) / 1000) <= 5
    });

    console.log(orchestra);
    console.log(JSON.stringify(orchestra));
    // musicians that sent something during the last 5 seconds only
    socket.write(JSON.stringify(activeMusicians) + "\n");
    
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

// unleash hell
init();