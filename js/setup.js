window.onload = function(){

	loadConnections();
	
	generateFilters();

	fillSelectors();

	var button = document.getElementById("findConnection");
	button.onclick = displayConnection;

	button = document.getElementById("findStats");
	button.onclick = generateAndDisplayStats;

	stanOptions.onchange = function(){loadConnections(); fillSelectors();};

	document.getElementById("defaultTab").click();
};

function loadConnections(){
	connectionGraph = getConnectionData();

	var stanCount = document.querySelector('input[name="stanOptions"]:checked').value;

	if (stanCount == "1"){
		addConnections(getOneStanConnections());
	} else if (stanCount == "2"){
		addConnections(getTwoStansConnections());
	} else if (stanCount == "n"){
		addConnections(getManyStansConnections());
	}

}

function addConnections(extraConnections){
	var allCharacters = connectionGraph.characters;
	var addedCharacters = false;
	for (var i = 0; i < connectionGraph.properties.length; i++){
		var media = connectionGraph.properties[i];
		for (var j = 0; j < extraConnections.length; j++){
			var connection = extraConnections[j];
			if (connection.media == media.name){
				// add characters to the master list
				if (allCharacters.indexOf(connection.p1) == -1){
					allCharacters.push(connection.p1);
				}
				if (allCharacters.indexOf(connection.p2) == -1){
					allCharacters.push(connection.p2);
				}
				// add characters to the medias character list
				if (media.characters.indexOf(connection.p1) == -1){
					media.characters.push(connection.p1);
				}
				if (media.characters.indexOf(connection.p2) == -1){
					media.characters.push(connection.p2);
				}
				// add connection to the medias connection list
				media.interactions.push(connection);
			}
		}
		media.characters.sort();
	}
	allCharacters.sort();
}