window.onload = function(){
    
    var noticeDiv = document.getElementById("js_notice");
    
    try{

        loadConnections();
        
        generateFilters();

        fillSelectors();

        var button = document.getElementById("findConnection");
        button.onclick = displayConnection;

        button = document.getElementById("findStats");
        button.onclick = generateAndDisplayStats;

        stanOptions.onchange = function(){loadConnections(); fillSelectors(); updateMediaStatsTab();};

        addMediaStats();

        document.getElementById("defaultTab").click();
        
        removeChildren(noticeDiv);
    } catch (err) {
        removeChildren(noticeDiv);
        // IE test from http://stackoverflow.com/a/9851769
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        if (isIE) {
            addChild(noticeDiv, "p", "Internet Explorer isn't able to run the code on this site. Sorry about that. It should work in Chrome, Firefox, or Edge though");
        } else {
            addChild(noticeDiv, "p", "An error occured setting up the page, so the site probably won't work correctly. You might be able to run it in a different browser though.");
        }
        
    }
    
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