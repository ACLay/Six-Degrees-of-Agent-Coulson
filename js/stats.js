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
	// based on "A faster algorithm for betweenness centrality", Ulrik Brandes (2001)
	//	sigma - number of paths between a given pair of nodes
	//	delta(v) for s,t - ratio of shortest paths between s,t that v lies on
	var reachableCharacters = findConnectedCharacters(rootCharacter);
	var characterStats = new Map();
	
	for (var i = 0; i < reachableCharacters.length; i++){
		updateProgressLabel("Initialising stats");
		var person = reachableCharacters[i];
		var stats = {
				"name":person,
				"totalDistance":0,
				"greatestDistance":0,
				"averageDistance":0,
				"furthestCharacters":[],
				"centrality":0
			};;
		characterStats.set(person, stats);
	}

	for (var i = 0; i < reachableCharacters.length; i++){
		updateProgressLabel("Calculating stats: " + (i + 1) + "/" + reachableCharacters.length);
		var s = reachableCharacters[i];
		
		var pq = exploreFrom(s, characterStats);
		
		while (pq.length !== 0){
			var w = pq.dequeue();
			
			for(var v of w.predecessors){
				var vStats = characterStats.get(v);
				var c = ((vStats.sigma / w.sigma) * (1.0 + w.delta));
				vStats.delta = vStats.delta + c;
			}
			if (w.name !== s){
				w.centrality = w.centrality + w.delta;
			}
		}
		var sStats = characterStats.get(s);
		sStats.averageDistance = sStats.totalDistance / (reachableCharacters.length - 1);
	}


	//normalise values
	var normalFactor = (reachableCharacters.length - 1) * (reachableCharacters.length - 2) / 2.0;
	for (var [name, stats] of characterStats){
		stats.centralityPercent = ((stats.centrality / normalFactor) * 100).toPrecision(5) + "%";
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

function exploreFrom(person, characterStats){
	var Q = [];
	var S = new PriorityQueue({ comparator: function(a, b) { return b.distance - a.distance; }});

	for (var [key,stats] of characterStats){
		stats.predecessors = new Set();
		stats.sigma = 0;
		stats.distance = -1;
	}

	Q.push(person);
	var pStats = characterStats.get(person);
	pStats.sigma = 1;
	pStats.distance = 0;

	while(Q.length !== 0){
		var v = Q.shift();
		var vStats = characterStats.get(v);
		S.queue(vStats);

		for (var connection of getConnections(v)){
			var w = connection.person;
			var wStats = characterStats.get(w);

			if (wStats.distance == -1){
				wStats.distance = vStats.distance + 1;
				
				if (wStats.distance > pStats.greatestDistance){
					pStats.greatestDistance = wStats.distance;
					pStats.furthestCharacters = [wStats.name];
				} else if (wStats.distance == pStats.greatestDistance){
					pStats.furthestCharacters.push(wStats.name);
				}
				pStats.totalDistance += wStats.distance;
				
				Q.push(w);
			}

			if (wStats.distance == vStats.distance + 1){
				wStats.sigma = wStats.sigma + vStats.sigma;
				wStats.predecessors.add(v);
			}
		}
	}
	for (var [key,stats] of characterStats){
		stats.delta = 0;
	}
	return S;
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
		sorttable.innerSortFunction.apply(myTH, []);
		var button = document.getElementById("findStats");
		button.disabled = false;
	},0);
}

function displayGraphStats(characterStats){
	var characterCount = characterStats.size;
	var averageSum = 0;
	var centralitySum = 0;
	for(var stats of characterStats.values()){
		averageSum += stats.averageDistance;
		centralitySum += stats.centrality;
	}
	var averageLength = averageSum / characterCount;
	var averageCentrality = centralitySum / characterCount;
	var normalFactor = (characterCount - 1) * (characterCount - 2) / 2.0;
	var centralityPercent = ((averageCentrality / normalFactor) * 100).toPrecision(5) + "%";
	var resultElement = document.getElementById("statsResult");
	addChild(resultElement, "p", "Average distance: " + averageLength.toFixed(3));
	addChild(resultElement, "p", "Average paths found in: " + centralityPercent);
}

function updateProgressLabel(message){
	progressLabel.textContent = message;
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
	addChild(row,"th","Paths found in");
	addChild(row,"th","Average distance");
	addChild(row,"th","Longest distance");
	addChild(row,"th","Farthest from");
	return table;
}

function addTableRow(tableBody, characterStats){
	var row = document.createElement("tr");
	
	addChild(row,"td",characterStats.name);
	addChild(row,"td",characterStats.centralityPercent);
	addChild(row,"td",characterStats.averageDistance.toFixed(3));
	addChild(row,"td",characterStats.greatestDistance);
	addChild(row,"td",characterStats.furthestCharacters.join(', '));

	tableBody.appendChild(row);
}

/*
 * Media Stats tab
 */

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

	var myTH = document.getElementById("mediaDefaultSortCollumn");
	sorttable.innerSortFunction.apply(myTH, []);

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