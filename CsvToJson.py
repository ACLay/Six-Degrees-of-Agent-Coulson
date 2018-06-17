from os import walk
from os import path
import json

allCharacters = set()
properties = {}
categories = set()

oneStanInteractions = []
twoStansInteractions = []
manyStansInteractions = []

for (dirpath, dirnames, filenames) in walk("./interactions"):
    for file in filenames:

        if file.endswith('.csv'):
            # optional Stan Lee connection files
            if (path.basename(dirpath) == "Stan Lee"):
                interactions = []
                filename = path.join(dirpath,file)
                for line in open(filename):
                    parts = line.strip().split('|',3)
                    interaction = {}
                    interaction['p1'] = parts[0]
                    interaction['p2'] = parts[1]
                    interaction['desc'] = parts[2]
                    interaction['media'] = parts[3]
                    interactions.append(interaction)
                # one stan lee file
                if (file == "One Stan.csv"):
                    oneStanInteractions = interactions
                # two stan lees file
                elif (file == "Two Stans.csv"):
                    twoStansInteractions = interactions
                # many stan lees file
                elif (file == "Many Stans.csv"):
                    manyStansInteractions = interactions
            # other connection files
            else:
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
                nameData = file[:-4].split('_',2)
                if (len(nameData) == 1):
                    categoryOrder = 0
                    name = nameData[0]
                else:
                    categoryOrder = int(nameData[0])
                    name = nameData[1]
                output['name'] = name
                output['category'] = category
                output['categoryOrder'] = categoryOrder
                output['characters'] = characters
                output['interactions'] = interactions
                # outfile = open(filename[:-3] + 'json','w')
                # outfile.write(json.dumps(output, indent=4, sort_keys=True))
                
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
# outfile = open('./interactions/connections.json','w')
# outfile.write(json.dumps(output, indent=2, sort_keys=True))

outfile = open('./js/connections.js','w')
outfile.write("var Coulson = Coulson || {};\n" +
    "Coulson.getConnectionData = function(){\nreturn " + json.dumps(output, indent=2, sort_keys=True) + "\n};\n" +
    "Coulson.getOneStanConnections = function(){\nreturn " + json.dumps(oneStanInteractions, indent=2) + "\n};\n" +
    "Coulson.getTwoStansConnections = function(){\nreturn " + json.dumps(twoStansInteractions, indent=2) + "\n};\n" +
    "Coulson.getManyStansConnections = function(){\nreturn " + json.dumps(manyStansInteractions, indent=2) + "\n};");