var Coulson = Coulson || {};

Coulson.displayConnection = function(){
	"use strict";
	var resultElement = document.getElementById("searchResult");
	this.removeChildren(resultElement);
	var source = this.getSelectorValue("goFrom");
	var target = this.getSelectorValue("goTo");
	var connection = this.calculateConnections(source, target);

	if (connection === null){
		this.addChild(resultElement,"p","No connection could be found through the current media");
	} else if (connection.start === connection.end){
		if (connection.start !== ""){
			this.addChild(resultElement,"h3",connection.start);
			this.addChild(resultElement,"p","is");
			this.addChild(resultElement,"h3",connection.start);
		}
	} else {
		var heading = connection.start + " and " + connection.end + " are ";
		if (connection.links.length === 1) {
			heading = heading + "1 connection apart";
		} else {
			heading = heading + connection.links.length + " connections apart";
		}
		this.addChild(resultElement,"h2",heading);
		this.addChild(resultElement,"h3",connection.start);
		for(var i = 0; i < connection.links.length; i++){
			var link = connection.links[i];
			this.addChild(resultElement,"p",link.link + " (" + link.media + ")");
			this.addChild(resultElement,"h3",link.person);
		}
	}
};

Coulson.calculateConnections = function(source, target){
	"use strict";
	
	if (source === target){
		return {
			"start":source,
			"end":target,
			"links":[]};
	} 

	var found = new Set();
	found.add(source);
	var routes = new Set();
	routes.add(
	{
		"start":source,
		"end":source,
		"links":[]
	});
	//for each length
	for (var length = 0; length < this.selectedConnections.size; length++){
		//for each 'leaf character'
		var newRoutes = new Set();
		var route;
		for (route of routes){
			//for each unfound character they neighbour
			var connections = this.getConnections(route.end);
			var connection;
			for (connection of connections){
				var neighbour = connection.person;
				if (!found.has(neighbour)){
					//make a new route
					var newRoute = {
						"start":source,
						"end":neighbour,
						"links":route.links.slice()
						};
						newRoute.links.push(connection);
					if (neighbour === target){
						return newRoute;
					}
					newRoutes.add(newRoute);
					found.add(neighbour);
				}
			}
		}
		//put in the new longer routes
		routes = newRoutes;
		//early exit if nothing to expand
		if (newRoutes.size === 0){
			return null;
		}
	}
	return null;
};

Coulson.getConnections = function(character) {
	"use strict";
	return this.selectedConnections.get(character);
};