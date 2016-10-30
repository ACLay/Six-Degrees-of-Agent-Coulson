var statsWorker;

function displayStats(){
	var button = document.getElementById("findStats")
	button.disabled = true;

	var resultElement = document.getElementById("statsResult");
	removeChildren(resultElement);

	var progressLabel = document.createElement("p");
	progressLabel.id = "progressLabel";
	resultElement.appendChild(progressLabel);

	var rootCharacter = getSelectorValue("rootCharacter");
			
	if (typeof(Worker) !== "undefined"){
		//if available, use a web worker so that a progress indicator can be shown
		if (typeof(statsWorker) == "undefined"){
			statsWorker = new Worker("js/stats_worker.js");
		}
		statsWorker.onmessage = function(e){
			if (e.data.complete){
				progressLabel.textContent = "Generating table";
				setTimeout(function(){
					var table = buildStatsTable(e.data.characterStats);
					removeChildren(resultElement);
					addGeneralStats(e.data.characterStats);
					resultElement.appendChild(table);

					sorttable.makeSortable(table);
					var myTH = document.getElementsByTagName("th")[0];
					sorttable.innerSortFunction.apply(myTH, []);
					button.disabled = false;
				},0);
			} else {
				progressLabel.textContent = e.data.progressMessage;
			}
		}
		var selections = new Map();
		for (var i=0; i < connectionGraph.properties.length;i++){
			var property = connectionGraph.properties[i].name;
			selections.set(property,{"checked":isMediaSelected(property)});
		}
		statsWorker.postMessage({"root":rootCharacter, "graph":connectionGraph, "selections":selections});
	} else {
		progressLabel.textContent = "This might take a while..."
		setTimeout(function(){

			var characterStats = getGraphStats(rootCharacter, progressLabel);
			progressLabel.textContent = "Generating table";
			var table = buildStatsTable(characterStats);
			removeChildren(resultElement);
			addGeneralStats(characterStats);
			resultElement.appendChild(table);

			sorttable.makeSortable(table);
			var myTH = document.getElementsByTagName("th")[0];
			sorttable.innerSortFunction.apply(myTH, []);
			button.disabled = false;
		},0);
	}
}

function addGeneralStats(characterStats){
	var characterCount = characterStats.size;
	var averageSum = 0;
	for(var stats of characterStats.values()){
		averageSum += stats.averageDistance;
	}
	var averageLength = averageSum / characterCount;
	var resultElement = document.getElementById("statsResult");
	addChild(resultElement, "p", "Average Distance: "+averageLength.toFixed(3));
}

function getGraphStats(rootCharacter, progressLabel){
	// list reachable characters
	var reachableCharacters = [];
	var allCharacters = listCharactersFromSelectedMedia();
	var characterStats = new Map();
	var longestRouteLength = 0;
	var longestRoutes = [];
	progressLabel.textContent = "Listing connected characters";
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
		progressLabel.textContent = "Calculating connections: " + calculated + "/" + toCalculate;
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
	
	return characterStats;
}

function findBestConnected(allStats){
	var bestStats = [{"totalDistance":Number.MAX_SAFE_INTEGER}];
	for(var stats of allStats.values()){
		if (stats.totalDistance < bestStats[0].totalDistance){
			bestStats = [stats];
		} else if (stats.totalDistance == bestStats[0].totalDistance){
			bestStats.push(stats);
		}
	}
	return bestStats;
}

function findWorstConnected(allStats){
	var worstStats = [{"totalDistance":-1}];
	for(var stats of allStats.values()){
		if (stats.totalDistance > worstStats[0].totalDistance){
			worstStats = [stats];
		} else if (stats.totalDistance == worstStats[0].totalDistance){
			worstStats.push(stats);
		}
	}
	return worstStats;
}

function addRouteToStats(stats,route,otherPerson){
	stats.totalDistance += route.links.length;
	if (route.links.length > stats.greatestDistance){
		stats.greatestDistance = route.links.length;
		stats.furthestCharacters = [otherPerson];
	} else if (route.links.length == stats.greatestDistance){
		stats.furthestCharacters.push(otherPerson);
	}
}

function buildStatsTable(statsMap){
	var table = createTable();
	var body = document.createElement("tbody");
	table.appendChild(body);

	for (var stats of statsMap.values()){
		addTableRow(body,stats);
	}

	return table;
}

function createTable(){
	var table = document.createElement("table");
	table.classList.add("sortable");
	var head = document.createElement("thead");
	table.appendChild(head);
	var row = document.createElement("tr");
	head.appendChild(row);
	addChild(row,"th","Name");
	addChild(row,"th","Average Distance");
	addChild(row,"th","Longest Distance");
	addChild(row,"th","Farthest from");
	return table;
}

function addTableRow(tableBody, characterStats){
	var row = document.createElement("tr");
	
	addChild(row,"td",characterStats.name);
	addChild(row,"td",characterStats.averageDistance.toFixed(3));
	addChild(row,"td",characterStats.greatestDistance);
	addChild(row,"td",characterStats.furthestCharacters);

	tableBody.appendChild(row);
}