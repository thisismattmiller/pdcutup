import json


cle = json.load(open('data/cledata.json'))

with open("data/cledata.ndjson", 'w') as out:

	for x in cle:

		out.write(json.dumps(x) +"\n")


