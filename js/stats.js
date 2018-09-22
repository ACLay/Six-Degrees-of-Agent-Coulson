var Coulson = Coulson || {};

Coulson.statsWorker = undefined;

Coulson.progressLabel = undefined;

Coulson.generateAndDisplayStats = function(){
	"use strict";
	var button = document.getElementById("findStats");
	button.disabled = true;

	var resultElement = document.getElementById("statsResult");
	this.removeChildren(resultElement);

	this.progressLabel = document.createElement("p");
	this.progressLabel.id = "progressLabel";
	resultElement.appendChild(this.progressLabel);

	var rootCharacter = this.getSelectorValue("rootCharacter");
	
	if (typeof(Worker) !== "undefined"){
		var context = this;
		//if available, use a web worker so that a progress indicator can be shown
		if (typeof(this.statsWorker) === "undefined"){
			this.statsWorker = new Worker("js/stats_worker.js");
		}
		this.statsWorker.onmessage = function(e){
			if (e.data.complete){
				context.displayStats(e.data.characterStats);
			} else {
				context.updateProgressLabel(e.data.progressMessage);
			}
		};
		this.statsWorker.postMessage({"root":rootCharacter, "connections":this.selectedConnections, "graph":this.connectionGraph});
		// If the worker can't be created (eg unable to download the script)
		// this will revert to calculating in the main thread
		this.statsWorker.addEventListener(
			"error",
			function(e){
				context.generateAndDisplayMainThread(rootCharacter);
				context.statsWorker = undefined;
			},
			false);
	} else {
		this.generateAndDisplayMainThread(rootCharacter);
	}
};

Coulson.generateAndDisplayMainThread = function(rootCharacter){
	"use strict";
	console.log("calculating stats in main thread");
	this.updateProgressLabel("Calculating stats. This could take a while...");
	var context = this;
	setTimeout(function(){
		context.generateAndDisplayStatsFrom(rootCharacter);
	},0);
};

Coulson.generateAndDisplayStatsFrom = function(rootCharacter){
	"use strict";
	var startTime = new Date().getTime();
	// based on "A faster algorithm for betweenness centrality", Ulrik Brandes (2001)
	//	sigma - number of paths between a given pair of nodes
	//	delta(v) for s,t - ratio of shortest paths between s,t that v lies on
	this.updateProgressLabel("Listing connected characters");
	var reachableCharacters = this.findConnectedCharacters(rootCharacter);
	var characterStats = new Map();
	
	for (var i = 0; i < reachableCharacters.length; i++){
		this.updateProgressLabel("Initialising stats");
		var person = reachableCharacters[i];
		var stats = {
				"name":person,
				"totalDistance":0,
				"greatestDistance":0,
				"averageDistance":0,
				"furthestCharacters":[],
				"centrality":0
			};
		characterStats.set(person, stats);
	}

	for (i = 0; i < reachableCharacters.length; i++){
		this.updateProgressLabel("Calculating stats: " + (i + 1) + "/" + reachableCharacters.length);
		var s = reachableCharacters[i];
		
		var pq = this.exploreFrom(s, characterStats);
		
		while (pq.length !== 0){
			var w = pq.dequeue();
			
			for(var vStats of w.predecessors){
				vStats.delta += ((vStats.sigma / w.sigma) * (1.0 + w.delta));
			}
			if (w.name !== s){
				w.centrality += w.delta;
			}
		}
		var sStats = characterStats.get(s);
		sStats.averageDistance = sStats.totalDistance / (reachableCharacters.length - 1);
	}

	var endTime = new Date().getTime();
	console.log("stats calculated in " + (endTime - startTime) + "ms");
	this.displayStats(characterStats);
};

Coulson.findConnectedCharacters = function(rootCharacter){
	"use strict";
	if(rootCharacter === ""){
		return [];
	}

	var reachableCharacters = [rootCharacter];
	
	var found = new Set();
	found.add(rootCharacter);
	var leaves = new Set();
	leaves.add(rootCharacter);
	//for each length
	for (var length = 0; length < this.connectionGraph.characters.length; length++){
		//for each 'leaf character'
		var newLeaves = new Set();
		for (var leaf of leaves){
			//for each unfound character they neighbour
			var connections = this.getConnections(leaf);
			for (var connection of connections){
				var neighbour = connection.person;
				if (!found.has(neighbour)){
					//make a new route
					newLeaves.add(neighbour);
					reachableCharacters.push(neighbour);
					found.add(neighbour);
				}
			}
		}
		//put in the new longer routes
		leaves = newLeaves;
		//early exit if nothing to expand
		if (newLeaves.size === 0){
			break;
		}
	}
	return reachableCharacters;
};

Coulson.exploreFrom = function(person, characterStats){
	"use strict";
	var Q = [];
	var S = new PriorityQueue({ comparator: function(a, b) { return b.distance - a.distance; }});

	for (var stats of characterStats.values()){
		stats.predecessors = new Set();
		stats.sigma = 0;
		stats.distance = -1;
		stats.delta = 0;
	}

	var pStats = characterStats.get(person);
	pStats.sigma = 1;
	pStats.distance = 0;
	Q.push(pStats);
	
	while(Q.length !== 0){
		var vStats = Q.shift();
		S.queue(vStats);

		for (var connection of this.getConnections(vStats.name)){
			var w = connection.person;
			var wStats = characterStats.get(w);

			if (wStats.distance === -1){
				wStats.distance = vStats.distance + 1;
				
				if (wStats.distance > pStats.greatestDistance){
					pStats.greatestDistance = wStats.distance;
					pStats.furthestCharacters = [wStats.name];
				} else if (wStats.distance === pStats.greatestDistance){
					pStats.furthestCharacters.push(wStats.name);
				}
				pStats.totalDistance += wStats.distance;
				
				Q.push(wStats);
			}

			if (wStats.distance === vStats.distance + 1){
				wStats.sigma += vStats.sigma;
				wStats.predecessors.add(vStats);
			}
		}
	}
	return S;
};

Coulson.displayStats = function(characterStats){
	"use strict";
	var resultElement = document.getElementById("statsResult");

	this.updateProgressLabel("Generating table");
	var context = this;
	setTimeout(function(){
		var table = context.buildStatsTable(characterStats);
		context.removeChildren(resultElement);
		context.displayGraphStats(characterStats);
		resultElement.appendChild(table);

		// make the table sortable
		sorttable.makeSortable(table);
		var myTH = document.getElementsByTagName("th")[1];
		sorttable.innerSortFunction.apply(myTH, []);
		sorttable.innerSortFunction.apply(myTH, []);
		var button = document.getElementById("findStats");
		button.disabled = false;
	},0);
};

Coulson.displayGraphStats = function(characterStats){
	"use strict";
	var characterCount = characterStats.size;
	var averageSum = 0;
	var centralitySum = 0;
	for(var stats of characterStats.values()){
		averageSum += stats.averageDistance;
		centralitySum += stats.centrality;
	}
	var averageLength = averageSum / characterCount;
	var averageCentrality = centralitySum / characterCount;
	
	var resultElement = document.getElementById("statsResult");
	this.addChild(resultElement, "p", "Average distance between two characters: " + averageLength.toFixed(3));
	this.addChild(resultElement, "p", "Average pairs a character is found between: " + (averageCentrality/2).toFixed(0));
};

Coulson.updateProgressLabel = function(message){
	"use strict";
	if (this.progressLabel !== undefined){
		this.progressLabel.textContent = message;
	}
};

Coulson.buildStatsTable = function(statsMap){
	"use strict";
	var table = this.initializeStatsTable();
	var body = document.createElement("tbody");
	table.appendChild(body);

	for (var stats of statsMap.values()){
		this.addTableRow(body,stats);
	}

	return table;
};

Coulson.initializeStatsTable = function(){
	"use strict";
	var table = document.createElement("table");
	table.classList.add("sortable");
	var head = document.createElement("thead");
	table.appendChild(head);
	var row = document.createElement("tr");
	head.appendChild(row);
	this.addChild(row,"th","Name");
	this.addChild(row,"th","Pairs found between");
	this.addChild(row,"th","Average distance");
	this.addChild(row,"th","Longest distance");
	this.addChild(row,"th","Farthest from");
	return table;
};

Coulson.addTableRow = function(tableBody, characterStats){
	"use strict";
	var row = document.createElement("tr");
	
	this.addChild(row,"td",characterStats.name);
	this.addChild(row,"td",(characterStats.centrality/2).toFixed(0));
	this.addChild(row,"td",characterStats.averageDistance.toFixed(3));
	this.addChild(row,"td",characterStats.greatestDistance);
	this.addChild(row,"td",characterStats.furthestCharacters.join(', '));

	tableBody.appendChild(row);
};

/*
 * Media Stats tab
 */

Coulson.mediaStatsRows = new Map();

Coulson.addMediaStats = function(){
	"use strict";
	var tableBody = document.getElementById("mediaStatsTableBody");
	this.removeChildren(tableBody);

	for (var i = 0; i < this.connectionGraph.properties.length; i++){
		var media = this.connectionGraph.properties[i];
		var interactions = media.interactions.length;
		var linksPerPerson = 2 * interactions / media.characters.length;

		var row = document.createElement("tr");
		tableBody.appendChild(row);
		this.addChild(row,"td",media.name);
		this.addChild(row,"td",media.category);
		this.addChild(row,"td",media.characters.length);
		this.addChild(row,"td",interactions);
		this.addChild(row,"td",linksPerPerson.toFixed(3));
		this.mediaStatsRows.set(media.name,row);
	}

	var myTH = document.getElementById("mediaDefaultSortCollumn");
	sorttable.innerSortFunction.apply(myTH, []);

	this.updateAvailableCharactersLabel();
};

Coulson.updateMediaStatsTab = function(){
	"use strict";
	for (var i = 0; i < this.connectionGraph.properties.length; i++){
		var media = this.connectionGraph.properties[i];
		var statRow = this.mediaStatsRows.get(media.name);
		this.setHidden(statRow, !this.isMediaSelected(media.name));
	}
	this.updateAvailableCharactersLabel();
};

Coulson.updateAvailableCharactersLabel = function(){
	"use strict";
	var label = document.getElementById("mediaStatsPeople");
	label.textContent = "Characters available: " + this.selectedConnections.size + "/" + this.connectionGraph.characters.length;
};
