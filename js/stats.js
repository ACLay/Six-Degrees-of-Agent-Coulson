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
		updateProgressLabel("Calculating stats. This could take a while...");
		setTimeout(function(){
			generateAndDisplayStatsFrom(rootCharacter);
		},0);
	}
}

function generateAndDisplayStatsFrom(rootCharacter){
	var reachableCharacters = findConnectedCharacters(rootCharacter);
	var characterStats = new Map();

	for (var i = 0; i < reachableCharacters.length; i++){
		updateProgressLabel("Calculating character stats: " + (i + 1) + "/" + reachableCharacters.length);
		var person = reachableCharacters[i];
		var stats = calculateStatsFor(person, reachableCharacters);
		characterStats.set(person, stats);
	}
	
	displayStats(characterStats);
}

function findConnectedCharacters(rootCharacter){
	var reachableCharacters = [rootCharacter];
	var allCharacters = listCharactersFromSelectedMedia();
	
	var found = new Set();
	found.add(rootCharacter);
	var leaves = new Set();
	leaves.add(rootCharacter);
	//for each length
	updateProgressLabel("Listing connected characters");
	for (var length = 0; length < allCharacters.length; length++){
		//for each 'leaf character'
		var newLeaves = new Set();
		for (var leaf of leaves){
			//for each unfound character they neighbour
			var connections = getConnections(leaf);
			for (var connection of connections){
				var neighbour = connection.person;
				if (!found.has(neighbour)){
					//make a new route
					newLeaves.add(neighbour);
					reachableCharacters.push(neighbour);
					found.add(neighbour);
				}
			};
		}; 
		//put in the new longer routes
		leaves = newLeaves;
		//early exit if nothing to expand
		if (newLeaves.size == 0){
			break;
		}
	}
	return reachableCharacters;
}

function calculateStatsFor(character,reachableCharacters){
	
	var stats = {
				"name":character,
				"totalDistance":0,
				"greatestDistance":0,
				"averageDistance":0,
				"furthestCharacters":[]
			};

	var found = new Set();
	found.add(character);
	var routes = new Set();
	routes.add(
	{
		"start":character,
		"end":character,
		"links":[]
	});
	var length;
	//for each length
	for (length = 0; length < reachableCharacters.length; length++){
		//for each 'leaf character'
		var newRoutes = new Set();
		var route;
		for (route of routes){
			//for each unfound character they neighbour
			var connections = getConnections(route.end);
			var connection;
			for (connection of connections){
				var neighbour = connection.person;
				if (!found.has(neighbour)){
					//make a new route
					var newRoute = {
						"start":character,
						"end":neighbour,
						"links":route.links.slice()
						};
					newRoute.links.push(connection)
					newRoutes.add(newRoute);
					found.add(neighbour);
					addRouteToStats(stats,newRoute);
				}
			};
		}; 
		//put in the new longer routes
		routes = newRoutes;
		//early exit if nothing to expand
		if (newRoutes.size == 0){
			break;
		}
	}
	stats.averageDistance = stats.totalDistance / (reachableCharacters.length - 1);
	return stats;
};

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
		var button = document.getElementById("findStats");
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

function updateProgressLabel(message){
	progressLabel.textContent = message;
}

function addRouteToStats(stats,route){
	var otherCharacter = route.end;

	stats.totalDistance += route.links.length;
	if (route.links.length > stats.greatestDistance){
		stats.greatestDistance = route.links.length;
		stats.furthestCharacters = [otherCharacter];
	} else if (route.links.length == stats.greatestDistance){
		stats.furthestCharacters.push(otherCharacter);
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

var mediaStatsRows = new Map();

function addMediaStats(){
	var tableBody = document.getElementById("mediaStatsTableBody");
	removeChildren(tableBody);

	for (var i = 0; i < connectionGraph.properties.length; i++){
		var media = connectionGraph.properties[i];

		var row = document.createElement("tr");
		tableBody.appendChild(row);
		addChild(row,"td",media.name);
		addChild(row,"td",media.category);
		addChild(row,"td",media.characters.length);
		if (media.name == "A Funny Thing Happened..."){
			addChild(row,"td",0);
			addChild(row,"td",0.000);
		} else {
			addChild(row,"td",media.interactions.length);
			var linksPerPerson = 2 * media.interactions.length / media.characters.length;
			addChild(row,"td",linksPerPerson.toFixed(3));
		}
		mediaStatsRows.set(media.name,row);
	}
	updateAvailableCharactersLabel();
}

function updateMediaStatsTab(){
	for (var i = 0; i < connectionGraph.properties.length; i++){
		var media = connectionGraph.properties[i];
		var statRow = mediaStatsRows.get(media.name);
		setHidden(statRow, !isMediaSelected(media.name));
	}
	updateAvailableCharactersLabel();
}

function updateAvailableCharactersLabel(){
	var label = document.getElementById("mediaStatsPeople");
	label.textContent = "Characters available: " + listCharactersFromSelectedMedia().length + "/" + connectionGraph.characters.length;
}