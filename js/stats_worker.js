"use strict";

importScripts('solver.js', 'filters.js', 'stats.js', 'lib/priority-queue.js');

//Overrides the UI functions from stats.js to use the web workers feedback function,
//operating in the document scope which, unlike the web worker scope, can access the UI
updateProgressLabel = function(message){
	postMessage({"complete":false,"progressMessage":message});
}
displayStats = function(characterStats){
	postMessage({"complete":true,"characterStats":characterStats});
}

//Global data structures in the web workers scope
var connectionGraph;

onmessage = function(e){
	console.log('calculating stats in web worker');
	connectionGraph = e.data.graph;
	mediaCheckboxes = e.data.selections;
	generateAndDisplayStatsFrom(e.data.root);
};