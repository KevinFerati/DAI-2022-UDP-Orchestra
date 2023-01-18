// change to '../../config.json' to test locally ---- FIXME WITH BETTER SOLUTION
const mainConfig = require('./config.json');
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
}

let orchestra = [];

function registerMusicianSound(uuid, sound) {
  for(let m of orchestra) {
    // musician already said something - update active since date
    if(m.uuid == uuid) {
      m.activeSince = new Date();
      return;
    }
  }
  // musician never said anything - add it
  orchestra.push(new Musician(uuid, sound));
}

// to be deleted - debugging purpose
function test() {
  registerMusicianSound(123456, "pouet");
  setInterval(function() {registerMusicianSound(123, "trulu");}, 10000);
}

function init() {
  // start listening to the musicians
  startUDPSubscribtion();
  // start sending informations about the musicians
  startTCPStream();

  // image musician mock test - to be deleted - debugging purpose
  // test();
}

// UDP subscription to the orchestra
function startUDPSubscribtion() {
  const socket = dgram.createSocket('udp4');
  socket.bind(mainConfig.musicianToListenerProtocol.port, function() {
    console.log('UDP --------------- joining multicast group');
    socket.addMembership(mainConfig.musicianToListenerProtocol.adress);
  });

  socket.on('message', function(msg, source) {
    console.log(`UDP --------------- new message : ${msg.toString()}`);
    registerMusicianSound(msg.toString());
  });
}

// start TCP server to publish the orchestra info
function startTCPStream() {
  const server = new net.Server();
  server.listen(auditorConfig.TCPServerPort, function() {
    console.log(`TCP --------------- server is listening ! Port: ${server.address().port} , address: ${server.address().address}`);
  });

  server.on('connection', function(socket) {
    console.log('TCP --------------- a client is connected !');
    // when a client is connected : directly send the orchestra info

    let activeMusicians = [];
    const now = new Date();
    for(let m of orchestra) {
      const sec = (now.getTime() - m.activeSince.getTime()) / 1000;
      console.log(`TCP --------------- musician no ${m.uuid} : active ${sec} seconds ago`);
      if(sec <= 5) {
        // musicians that sent something during the last 5 seconds only
        activeMusicians.push(m);
      }
    }
    
    socket.write(JSON.stringify(activeMusicians) + "\n");
    
    // emit the data only once - Half-close the socket
    socket.end();

    socket.on('end', function() {
      console.log('TCP --------------- closing connection');
    });

    socket.on('error', function(error) {
      console.log(`TCP --------------- Error : ${error}`);
    });
  });
}

// unleash hell
init();