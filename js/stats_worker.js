
importScripts('solver.js');

function addRouteToStats(stats,route,otherPerson){
	stats.totalDistance += route.links.length;
	if (route.links.length > stats.greatestDistance){
		stats.greatestDistance = route.links.length;
		stats.furthestCharacters = [otherPerson];
	} else if (route.links.length == stats.greatestDistance){
		stats.furthestCharacters.push(otherPerson);
	}
}

function getGraphStats(rootCharacter){
	// list reachable characters
	var reachableCharacters = [];
	var allCharacters = listCharactersFromSelectedMedia();
	var characterStats = new Map();
	var longestRouteLength = 0;
	var longestRoutes = [];
	postMessage({"complete":false,"progressMessage":"Finding connected characters"});
	for (var i = 0; i < allCharacters.length; i++){
		var character = allCharacters[i];
		var route = calculateConnections(rootCharacter,character);
		if (route !== null){
			characterStats.set(character,{
				"name":character,
				"totalDistance":0,
				"greatestDistance":0,
				"averageDistance":0,
				"furthestCharacters":[]
			});
			reachableCharacters.push(character);
		}
	}
	var toCalculate = reachableCharacters.length * (reachableCharacters.length - 1) / 2;
	var calculated = 0;
	// for each pairing
	for (var i = 0; i < reachableCharacters.length; i++){
		postMessage({"complete":false,"progressMessage":"Calculating connections " + calculated + "/" + toCalculate});
		var personA = reachableCharacters[i];
		var personAstats = characterStats.get(personA);
		for (var j = i+1; j < reachableCharacters.length; j++){
			var personB = reachableCharacters[j];
			var personBstats = characterStats.get(personB);
			//find the shortest link
			var route = calculateConnections(personA,personB);
			//increment their counts
			addRouteToStats(personAstats,route,personB);
			addRouteToStats(personBstats,route,personA);
			if (route.links.length > longestRouteLength){
				longestRouteLength = route.links.length;
				longestRoutes = [route];
			} else if (route.links.length == longestRouteLength){
				longestRoutes.push(route);
			}
			calculated++;
		}
		personAstats.averageDistance = personAstats.totalDistance/(reachableCharacters.length-1);
	}
	
	postMessage({"complete":true,"characterStats":characterStats});
	
}

function isMediaSelected(mediaName){
	return selections.get(mediaName);
}

function listCharactersFromSelectedMedia(){
	var characters = new Set();
	console.log(connectionGraph);
	for(var i=0; i < connectionGraph.properties.length; i++){
		var media = connectionGraph.properties[i];
		var name = media.name;
		if (isMediaSelected(name)){
			for(var j=0; j < media.characters.length; j++){
				characters.add(media.characters[j]);
			}
		}
	}
	return Array.from(characters).sort()
}

var connectionGraph;
var selections;

onmessage = function(e){
	connectionGraph = e.data.graph;
	selections = e.data.selections;
	console.log(e.data);
	getGraphStats(e.data.root);
};