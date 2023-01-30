## Task 1: design the application architecture and protocols

### How can we represent the system in an architecture diagram, which gives information both about the Docker containers, the communication protocols and the commands?
Insert your diagram here...

### Who is going to send UDP datagrams and when?
Un datagramme est émis par un musicien à chaque fois qu'il émet un son et chaque musicien actif émet un son toutes les secondes. Un musicien est une instance de l'application musicien qui tourne dans un conteneur docker basé sur la même image: "image-musician". Les conteneurs qui tournent en même temps constituent l'orchestre.

### Who is going to listen for UDP datagrams and what should happen when a datagram is received?
L'auditeur va se mettre à écouter les musiciens pour recevoir leurs datagrammes UDP quand ils émettent des sons. Lorsqu'il reçoit un datagramme, il va soit ajouter le musicien dans la liste des musiciens actifs (ayant émis un son récemment), soit le reconnaître dans la liste et mettre à jour l'heure de son dernier son émis.

### What payload should we put in the UDP datagrams?
Un datagramme UDP sera envoyé par un musicien à chaque fois qu'il émet un son. Le payload contiendra donc le son émis ainsi que l'uuid du musicien qui l'a généré comme ceci:
```json
{
	"uuid": "<uuid>",
	"sound": "x"
}
```

### What data structures do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures?
le(s) "receveur(s)" UDP, en l'occurence, le / les auditeur(s), va maintenir un dictionnaire contenant les musiciens actifs. Il va y ajouter des musiciens lorsque ces derniers émettent un datagramme UDP (donc un son) et les supprimer s'il détecte qu'un musicien a été silencieux trop longtemps. 

Cette structure rassemblera les musiciens actifs et sera envoyée à chaque client TCP se connectant à l'auditeur.

## Task 2: implement a "musician" Node.js application

### In a JavaScript program, if we have an object, how can we serialize it in JSON?

```javascript
let serializedJson = JSON.stringify({...});
```

### What is npm?
C'est un gestionnaire de paquets qui permet d'installer des programmes / modules, notamment pour des projets et applications NodeJS. Il gère également les dépendances des applications NodeJS.

### What is the npm install command and what is the purpose of the --save flag?
Permet d'installer un ou plusieurs paquet(s) disponible(s) sur npm. Le flag --save permet d'indiquer que ce sont des dépendances et de les indiquer dans package.json. Depuis NPM 5, le flag --save est redondant car les paquets sont automatiquement installés en tant que dépendances.

### How can we use the https://www.npmjs.com/ web site?
1. Chercher la fonctionnalité / paquet nécessaire
2. Aller sur la page du paquet qu'on cherche
3. Installer le paquet avec la commande sur la droite (on peut également regarder les versions minimums, la doc du paquet, etc) 

### In JavaScript, how can we generate a UUID compliant with RFC4122?

En utilisant le paquet suivant : `https://www.npmjs.com/package/uuid`

1. Installer le paquet `uuid` : `npm install uuid`
2. Dans un fichier JS, importer le paquet  : `const uuid = require("uuid");`
3. Générer un uuid (par exemple, v4) : `this.uuid = uuid.v4();`

### In Node.js, how can we execute a function on a periodic basis?

`setInterval(handler, intervalTimeInMiliseconds)`
`handler` doit être une fonction.

### In Node.js, how can we emit UDP datagrams?

En utilisant le module `dgram` déjà fourni avec nodejs puis : 

```javascript
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const buffer = new Buffer("...");

socket.send(buffer, 0, buffer.length, [PORT], [ADRESS], (err, bytes) => {
  console.log("sent a datagram");
});
```
En remplaçant [port] et [adress] par les valeurs voulues.

### In Node.js, how can we access the command line arguments?
Avec le tableau `process.argv`.

## Task 3: package the "musician" app in a Docker image

### What is the purpose of the ENTRYPOINT statement in our Dockerfile?
Cette instruction va exécuter la commande fournie dans les paramètres du ENTRYPOINT, dans l'ordre donnée au moment du lancement du conteneur. Elle va également suffixer les arguments données via la commande `docker run` aux paramètres donnés à ENTRYPOINT.

### How can we check that our running containers are effectively sending UDP datagrams?
Nous pouvons mettre un log avec `console.log` au callback de la fonction `socket.send` puis aller vérifier les logs du conteneur. Nous pouvons également faire la même chose dans l'auditeur, après la réception d'un datagramme.

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

Lorsque l'auditeur reçoit un son, une fonction va s'exécuter 5 secondes après la réception du son et va parcourir la map contenant les musiciens ayant émis un son. Si un des musiciens a émis son dernier son il y a trop longtemps il est supprimé de la map.
Ceci permet de toujours renvoyer la liste des musiciens actifs si en parallèle quelqu'un sollicite l'auditeur via une connection TCP.

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