const mainConfig = require('../../config.json');
const auditorConfig = require('./config.json');
const net = require('net');

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

// UDP subscription to the orchestra
// TODO

// TCP server to publish the info
function startTCPStream() {
  const server = new net.Server();
  server.listen(auditorConfig.AuditorTCPServer.port, auditorConfig.AuditorTCPServer.adress, function() {
    console.log(`server is listening ! Port: ${server.address().port} , address: ${server.address().address}`);
  });

  server.on('connection', function(socket) {
    console.log('a client is connected !');

    // when a client is connected : directly send the orchestra info
    socket.write(JSON.stringify(new Musician(1234, "pouet")) + "\n");
    
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

startTCPStream();