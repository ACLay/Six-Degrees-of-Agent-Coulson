from os import walk
from os import path
import json

allCharacters = set()
properties = {}
categories = set()

for (dirpath, dirnames, filenames) in walk("./interactions"):
    for file in filenames:
        if file.endswith('.csv'):
            filename = path.join(dirpath,file)
            characters = set()
            interactions = []
            for line in open(filename):
                parts = line.strip().split('|',2)
                characters.add(parts[0])
                characters.add(parts[1])
                interaction = {}
                interaction['p1'] = parts[0]
                interaction['p2'] = parts[1]
                interaction['desc'] = parts[2]
                interactions.append(interaction)
            output = {}
            characters = sorted(characters)
            category = path.basename(dirpath)
            name = file[:-4]
            output['name'] = name
            output['category'] = category
            output['characters'] = characters
            output['interactions'] = interactions
            outfile = open(filename[:-3] + 'json','w')
            outfile.write(json.dumps(output, indent=4, sort_keys=True))
            
            properties[name] = output
            categories.add(category)
            for character in characters:
                allCharacters.add(character)

propertylist = []
for key in sorted(properties.keys()):
    propertylist.append(properties[key])

output = {}
output['characters'] = sorted(allCharacters)
output['categories'] = sorted(categories)
output['properties'] = propertylist
outfile = open('./interactions/connections.json','w')
outfile.write(json.dumps(output, indent=2, sort_keys=True))

outfile = open('./js/connections.js','w')
outfile.write("function getConnectionData(){\nreturn " + json.dumps(output, indent=2, sort_keys=True) + "\n}")