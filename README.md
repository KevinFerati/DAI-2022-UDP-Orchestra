# Consignes importantes

## Constraints
Please be careful to adhere to the specifications in this document, and in particular
- the Docker image names
- the names of instruments and their sounds
- the TCP PORT number

## Validation
You will have to :
- send your GitHub URL, 
- answer the questions and 
- send the output log of the validate.sh script, which prove that your project is working in this Google Form.

# Formats

## Message Musicien à Auditeur

```json
{
	"uuid": "<uuid>",
	"sound": "x"
}
```

## config.json

```json
{
	"instruments": {
		"piano": "ti-ta-ti",
		"trumpet": "pouet",
		"flute": "trulu",
		"violin": "gzi-gzi",
		"drum": "boum-boum"
	},
	"musicianToListenerProtocol": {
		"port": 54321,
		"adress" : "239.255.3.5"
	}
}
```
## auditor_config.json
```json
{
	"TCPServerPort": 2205
}
```

## auditor TCP response
``` typescript
Musician {
   uuid: number,
   instrument: string,
   activeSince: Date
}
```