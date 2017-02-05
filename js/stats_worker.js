var Coulson = Coulson || {};

importScripts('solver.js', 'stats.js', 'lib/priority-queue.js');

//Overrides the UI functions from stats.js to use the web workers feedback function,
//operating in the document scope which, unlike the web worker scope, can access the UI
Coulson.updateProgressLabel = function(message){
	"use strict";
	postMessage({"complete":false,"progressMessage":message});
};
Coulson.displayStats = function(characterStats){
	"use strict";
	postMessage({"complete":true,"characterStats":characterStats});
};

onmessage = function(e){
	"use strict";
	console.log('calculating stats in web worker');
	Coulson.selectedConnections = e.data.connections;
	Coulson.connectionGraph = e.data.graph;
	Coulson.generateAndDisplayStatsFrom(e.data.root);
};