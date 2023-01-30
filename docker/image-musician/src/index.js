const mainConfig     = require('../../config.json');
const musicianConfig = require("./musician_config.json");
const dgram = require('dgram');
const uuid = require("uuid");

const instruments = mainConfig.instruments;
const protocol = mainConfig.musicianToListenerProtocol;

class Musician {
  constructor (instrument) {
    this.sound = instruments[instrument];
    this.uuid = uuid.v4();
  }
}

class MusicianHandler {
  constructor(instrument) {
    this.socket = new dgram.createSocket("udp4");
    this.musician = new Musician(instrument);
    this.emitSound = this.emitSound.bind(this);
  }

  emitSound() {
    let json = JSON.stringify(this.musician);
    let buffer  = new Buffer(json);

    this.socket.send(buffer, 0, buffer.length, protocol.port, protocol.adress, (err, bytes) => {
      if (err) {
        throw err;
      }
      console.log(this.musician.uuid + " is emitting " + this.musician.sound);
    });
  }
}

// Read the arguments for the instrument
const assignedInstrument = process.argv[2];

// Throw if the instrument is not present not present
if (!instruments.hasOwnProperty(assignedInstrument)) {
  throw new Error("The given instrument does not exist");
}


let musicianHandler = new MusicianHandler(assignedInstrument);

// Send a sound X seconds
setInterval(musicianHandler.emitSound, musicianConfig.soundEmissionIntervalInSecond * 1000);

