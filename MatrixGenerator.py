"""
Generates a blank connections file from a file containing a list of characters.
Output file contains all possible interactions, starting with those for the first character in the list.
Takes the input file path, output file path, and optional custom delimiter ('|' is default) as arguments.
"""

import sys

inputPath = sys.argv[1]
outputPath = sys.argv[2]
if len(sys.argv) > 3:
    delimiter = sys.argv[3]
else:
    delimiter = '|'

characters = []

for line in open(inputPath):
    line = line.strip()
    if not len(line) == 0:
        characters.append(line)

with open(outputPath, 'w') as outFile:
    for i in range(0, len(characters) - 1):
        for j in range(i + 1, len(characters)):
            outFile.write(characters[i] + delimiter + characters[j] + delimiter + '\n')
