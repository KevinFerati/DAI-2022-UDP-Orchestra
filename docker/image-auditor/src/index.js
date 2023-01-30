const mainConfig    = require('../../config.json');
const auditorConfig = require('./auditor_config.json');
const net   = require('net');
const dgram = require('dgram');

let orchestra = new Map();

class Musician {
    constructor(uuid, sound) {
      this.uuid       = uuid;
      this.instrument = ""
      // looking for the instrument making the given sound
      for (const [key, value] of Object.entries(mainConfig.instruments)) {
        if(value === sound) {
            this.instrument = key;
            break;
        }
      }
      this.activeSince = new Date();
    }
}

// ============================ Musicians management functions ==================================== //

function registerMusicianSound(uuid, sound) {
  console.log(`UDP --------------- I received ${sound} from ${uuid}`);
  orchestra.set(uuid, new Musician(uuid, sound));
}

function removeInactivePlayers() { 
  for (let [uuid, musician] of orchestra) {
    const secondsSinceLastSound = ((new Date()).getTime() - musician.activeSince.getTime()) / 1000;
    if (secondsSinceLastSound > auditorConfig.maxSecondsAsInactive) {
      // musician is inactive => we remove it from the orchestra following its unique uuid
      orchestra.delete(uuid);
    }
  }
}

// =============================== main Function =================================================== //

// for debugging purpose
function test() {
  registerMusicianSound(123456, "pouet");
  setInterval(function() {registerMusicianSound(123, "trulu");}, 10000);
}

function init() {
  // start listening to the musicians
  startUDPSubscribtion();
  // start sending informations about the musicians
  startTCPStream();

  // for debugging purpose
  // test();

  // detect and remove inactive musicians every x seconds
  // X = number of seconds without playing to be considered inactive
  setInterval(removeInactivePlayers, (auditorConfig.maxSecondsAsInactive * 1000));
}

// =============================== UDP subscription to the orchestra =============================== //

function startUDPSubscribtion() {
  const socket = dgram.createSocket('udp4');
  socket.bind(mainConfig.musicianToListenerProtocol.port, function() {
    console.log('UDP --------------- joining multicast group');
    socket.addMembership(mainConfig.musicianToListenerProtocol.adress);
  });

  socket.on('message', function(msg, source) {

    let soundOrigin = JSON.parse(msg.toString());
    registerMusicianSound(soundOrigin.uuid, soundOrigin.sound);
  });
}

// =============================== TCP server to publish the orchestra info ======================= //

function startTCPStream() {
  const server = new net.Server();
  server.listen(auditorConfig.TCPServerPort, function() {
    console.log(`TCP --------------- server is listening ! Port: ${server.address().port} , address: ${server.address().address}`);
  });

  server.on('connection', function(socket) {
    console.log('TCP --------------- a client is connected !');
    // directly send the orchestra info when a client is connected

    socket.write(JSON.stringify(Array.from(orchestra.values())) + "\n");
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
