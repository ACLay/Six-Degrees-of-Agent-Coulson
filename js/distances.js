var Coulson = Coulson || {};

// Do-and-show-it function
Coulson.generateAndShowDistances = function(){
	"use strict";

	var resultElement = document.getElementById("distanceResult");
	this.removeChildren(resultElement);

	var rootCharacter = this.getSelectorValue("distanceCharacter");
	var distanceLists = this.listDistances(rootCharacter);
	
	this.addChild(resultElement, "h2", "From " + rootCharacter);

	for (var i = 1; i < distanceLists.length; i++){
		var distanceHeading;
		if (i === 1){
			distanceHeading = "Directly connected";
		} else {
			distanceHeading = i + " connections away";
		}
		this.addChild(resultElement, "h3", distanceHeading);
		this.addChild(resultElement, "p", distanceLists[i].join(", "));
	}
};

// Make a list of character distances
Coulson.listDistances = function(rootCharacter){
	"use strict";
	var distanceLists = [];
	var found = new Set();

	distanceLists.push([rootCharacter]);
	found.add(rootCharacter);

	var leaves = [rootCharacter];
	for (var length = 0; length < this.selectedConnections.size; length++){
		var newNeighbours = [];
		for (var leaf of leaves){
			var connections = this.getConnections(leaf);
			for (var connection of connections){
				var neighbour = connection.person;
				if (!found.has(neighbour)){
					newNeighbours.push(neighbour);
					found.add(neighbour);
				}
			}
		}
		if (newNeighbours.length === 0){
			break;
		}
		distanceLists.push(newNeighbours);
		leaves = newNeighbours;
	}
	return distanceLists;
};