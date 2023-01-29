## Task 1: design the application architecture and protocols

### How can we represent the system in an architecture diagram, which gives information both about the Docker containers, the communication protocols and the commands?
Insert your diagram here...

### Who is going to send UDP datagrams and when?
Enter your response here...

### Who is going to listen for UDP datagrams and what should happen when a datagram is received?
Enter your response here...

### What payload should we put in the UDP datagrams?
Enter your response here...

### What data structures do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures?
Enter your response here...

## Task 2: implement a "musician" Node.js application

### In a JavaScript program, if we have an object, how can we serialize it in JSON?
Enter your response here...

### What is npm?
Enter your response here...

### What is the npm install command and what is the purpose of the --save flag?
Enter your response here...

### How can we use the https://www.npmjs.com/ web site?
Enter your response here...

### In JavaScript, how can we generate a UUID compliant with RFC4122?
Enter your response here...

### In Node.js, how can we execute a function on a periodic basis?
Enter your response here...

### In Node.js, how can we emit UDP datagrams?
Enter your response here...

### In Node.js, how can we access the command line arguments?
Enter your response here...

## Task 3: package the "musician" app in a Docker image

### What is the purpose of the ENTRYPOINT statement in our Dockerfile?
Enter your response here...

### How can we check that our running containers are effectively sending UDP datagrams?
Enter your response here...

## Task 4: implement an "auditor" Node.js application

### With Node.js, how can we listen for UDP datagrams in a multicast group?

En utilisant la bibliothèque intégrée à Node.js `dgram` permettant ici de créer des sockets UDP et qui nous sert à recevoir des messages comme ceci: 

#### 1 : connection
```javascript
const socket = dgram.createSocket('udp4');
  socket.bind(port, function() {
    socket.addMembership(adress);
  });
```
La méthode `addMembership()` permet de rejoindre le groupe multicast selon l'adresse donnée en paramètre.
#### 2: réception
```javascript
  socket.on('message', function(msg, source) {
    // I received a message ! Hurray !
  });
```
L'événement `message` est déclenché à chaque fois qu'un datagramme est reçu.

### How can we use the Map built-in object introduced in ECMAScript 6 to implement a dictionary?
Cette structure permet de stocker des paires clés-valeurs. 
Il est donc possible d'ajouter des entrées en décidant d'une clé associée afin de la retrouver facilement dans la structure. Cette dernière est itérable, il est donc possible de parcourir à la fois les clés et les valeurs.

On peut l'implémenter en javascript comme ceci : 
```javascript
let dictionary = new Map();
// ajout (ou modification si la clé est déjà présente) d'une valeur du dictionnaire
dictionary.set("Slitheen", "Raxacoricofallapatorius");
// récupération d'une valeur via sa clé
dictionary.get("Slitheen");
// suppression d'une valeur via sa clé
dictionary.delete("Slitheen");
// vérification si une paire clé-valeur existe dans le dictionnaire via la clé
dictionary.has("Slitheen");
```
### When and how do we get rid of inactive players?
Lorsque l'auditeur commence à écouter les musiciens, une fonction se déclenche toutes les 5 secondes et va parcourir la map contenant les musiciens ayant émis un son. Si un des musiciens a émis son dernier son il y a trop longtemps il est supprimé de la map.
Ceci permet de toujours renvoyer la liste des musiciens actifs si en parralèle quelqu'un sollicite l'auditeur via une connection TCP.

On peut supprimer un musicien comme indiqué plus haut via sa clé qui ici est son uuid, unique pour chaque musicien:
```javascript
 orchestra.delete(uuid);
```

### How do I implement a simple TCP server in Node.js?
le module `net` fournit une API permettant de créer des flux TCP.

#### 1. Mise en mode écoute
```javascript
const net   = require('net');
const server = new net.Server();
server.listen(auditorConfig.TCPServerPort, function() {
    // I am ready for new clients !
});
```
La méthode listen() démarre le serveur sur un port spécifique. la fonction indiquée ici sera appelée lorsque le serveur sera prêt à accepter des connexions.
#### 2. Réception des clients
```javascript
server.on('connection', function(socket) {
    // a client is connected !
});
```
Cette méthode sera déclenchée à chaque nouvelle connexion effectuée par un client , on envoie ici la liste des musiciens actifs par exemple.

## Task 5: package the "auditor" app in a Docker image

###  Send us the log file of the validation script to show that everything is ok
TODO : Log file