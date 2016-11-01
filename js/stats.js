var statsWorker;

function generateAndDisplayStats(){
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
				displayStats(e.data.characterStats);
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
			generateAndDisplayStatsFrom(rootCharacter);
		},0);
	}
}

function displayStats(characterStats){
	var resultElement = document.getElementById("statsResult");

	progressLabel.textContent = "Generating table";
	setTimeout(function(){
		var table = buildStatsTable(characterStats);
		removeChildren(resultElement);
		displayGraphStats(characterStats);
		resultElement.appendChild(table);

		// make the table sortable
		sorttable.makeSortable(table);
		var myTH = document.getElementsByTagName("th")[1];
		sorttable.innerSortFunction.apply(myTH, []);
		var button = document.getElementById("findStats")
		button.disabled = false;
	},0);
}

function displayGraphStats(characterStats){
	var characterCount = characterStats.size;
	var averageSum = 0;
	for(var stats of characterStats.values()){
		averageSum += stats.averageDistance;
	}
	var averageLength = averageSum / characterCount;
	var resultElement = document.getElementById("statsResult");
	addChild(resultElement, "p", "Average Distance: "+averageLength.toFixed(3));
}

//TODO rename:
function generateAndDisplayStatsFrom(rootCharacter){
	// list reachable characters
	var reachableCharacters = [];
	var allCharacters = listCharactersFromSelectedMedia();
	var characterStats = new Map();
	var longestRouteLength = 0;
	var longestRoutes = [];
	updateProgressLabel("Listing connected characters");
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
		updateProgressLabel("Calculating connections: " + calculated + "/" + toCalculate);
		var personA = reachableCharacters[i];
		var personAstats = characterStats.get(personA);
		for (var j = i+1; j < reachableCharacters.length; j++){
			var personB = reachableCharacters[j];
			var personBstats = characterStats.get(personB);
			//find the shortest link
			var route = calculateConnections(personA,personB);
			//increment their counts
			addRouteToStats(personAstats,route);
			addRouteToStats(personBstats,route);
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
	
	displayStats(characterStats);
}

// using functions to access the UI in the calculator function allows them to be overriden by the web worker
// so that the code can be reused without duplication
function updateProgressLabel(message){
	progressLabel.textContent = message;
}

function addRouteToStats(stats,route){
	stats.totalDistance += route.links.length;
	if (route.links.length > stats.greatestDistance){
		stats.greatestDistance = route.links.length;
		stats.furthestCharacters = [route.end];
	} else if (route.links.length == stats.greatestDistance){
		stats.furthestCharacters.push(route.end);
	}
}

function buildStatsTable(statsMap){
	var table = initializeStatsTable();
	var body = document.createElement("tbody");
	table.appendChild(body);

	for (var stats of statsMap.values()){
		addTableRow(body,stats);
	}

	return table;
}

function initializeStatsTable(){
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