from os import walk
from os import path

files = []
for (dirpath, dirnames, filenames) in walk("./interactions"):
	for file in filenames:
		if file.endswith('.csv'):
			files.append(path.join(dirpath,file))

people = set()
    
for file in files:
    print file
    for line in open(file):
        parts = line.strip().split(',')
        people.add(parts[0])
        people.add(parts[1])
        
characters = sorted(people)

for character in characters:
    print character 
