var Coulson = Coulson || {};

Coulson.connectionGraph = undefined;

Coulson.selectedConnections = undefined;

window.onload = function(){
    "use strict";
    var noticeDiv = document.getElementById("js_notice");
    
    try {
        Coulson.loadConnections();
        Coulson.generateFilters();
        Coulson.mapSelectedConnections();
        Coulson.fillSelectors();
        Coulson.addMediaStats();

        document.getElementById("mediaFrom").onchange = function(){
        	Coulson.updateSelector("mediaFrom", "goFrom");
        };
        document.getElementById("mediaTo").onchange = function(){
        	Coulson.updateSelector("mediaTo", "goTo");
        };
        document.getElementById("findConnection").onclick = function(){
        	Coulson.displayConnection();
        };

        document.getElementById("rootMedia").onchange = function(){
        	Coulson.updateSelector("rootMedia", "rootCharacter");
        };
        document.getElementById("findStats").onclick = function(){
        	Coulson.generateAndDisplayStats();
        };

        document.getElementById("distanceMedia").onchange = function(){
            Coulson.updateSelector("distanceMedia", "distanceCharacter");
        };
        document.getElementById("findDistances").onclick = function(){
            Coulson.generateAndShowDistances();
        };

        document.getElementById("selectAllMedia").onclick = function(){
        	Coulson.setAllCheckboxes(true);
        };
        document.getElementById("clearAllMedia").onclick = function(){
        	Coulson.setAllCheckboxes(false);
        };

        document.getElementById("stanOptions").onchange = function(){
        	Coulson.loadConnections();
        	Coulson.fillSelectors();
        	Coulson.updateMediaStatsTab();
            Coulson.mapSelectedConnections();
        };

        document.getElementById("connectionTabLink").onclick = function(){
        	Coulson.openTab("connectionTab", "connectionTabLink");
        };
        document.getElementById("statsTabLink").onclick = function(){
        	Coulson.openTab("statsTab", "statsTabLink");
        };
        document.getElementById("distancesTabLink").onclick = function(){
            Coulson.openTab("distancesTab", "distancesTabLink");
        };
        document.getElementById("mediaStatsTabLink").onclick = function(){
        	Coulson.openTab("mediaStatsTab", "mediaStatsTabLink");
        };
        document.getElementById("mediaFilterTabLink").onclick = function(){
        	Coulson.openTab("mediaFilterTab", "mediaFilterTabLink");
        };
        document.getElementById("creditsTabLink").onclick = function(){
        	Coulson.openTab("creditsTab", "creditsTabLink");
        };

        document.getElementById("connectionTabLink").click();
        
        Coulson.removeChildren(noticeDiv);
    } catch (err) {
    	console.log(err);
        Coulson.removeChildren(noticeDiv);
        // IE test from http://stackoverflow.com/a/9851769
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        if (isIE) {
            Coulson.addChild(noticeDiv, "p", "Internet Explorer isn't able to run the code on this site. Sorry about that. It should work in Chrome, Firefox, or Edge though");
        } else {
            Coulson.addChild(noticeDiv, "p", "An error occured setting up the page, so the site probably won't work correctly. You might be able to run it in a different browser though.");
        }
    }
};

Coulson.loadConnections = function(){
    "use strict";
	this.connectionGraph = this.getConnectionData();

	var stanCount = document.querySelector('input[name="stanOptions"]:checked').value;

	if (stanCount === "1"){
		this.addConnections(this.getOneStanConnections());
	} else if (stanCount === "2"){
		this.addConnections(this.getTwoStansConnections());
	} else if (stanCount === "n"){
		this.addConnections(this.getManyStansConnections());
	}
    // Sort properties by their order in their categories
    this.connectionGraph.properties.sort(function(a,b){
        return a.categoryOrder - b.categoryOrder;
    })
};

Coulson.addConnections = function(extraConnections){
    "use strict";
	var allCharacters = this.connectionGraph.characters;
	for (var i = 0; i < this.connectionGraph.properties.length; i++){
		var media = this.connectionGraph.properties[i];
		for (var j = 0; j < extraConnections.length; j++){
			var connection = extraConnections[j];
			if (connection.media === media.name){
				// add characters to the master list
				if (allCharacters.indexOf(connection.p1) === -1){
					allCharacters.push(connection.p1);
				}
				if (allCharacters.indexOf(connection.p2) === -1){
					allCharacters.push(connection.p2);
				}
				// add characters to the medias character list
				if (media.characters.indexOf(connection.p1) === -1){
					media.characters.push(connection.p1);
				}
				if (media.characters.indexOf(connection.p2) === -1){
					media.characters.push(connection.p2);
				}
				// add connection to the medias connection list
				media.interactions.push(connection);
			}
		}
		media.characters.sort();
	}
	allCharacters.sort();
};

Coulson.mapSelectedConnections = function(){
    "use strict";
    this.selectedConnections = new Map();
    // for each selected media
    var mediaList = this.connectionGraph.properties;
    for (var i = 0; i < mediaList.length; i++){
        var media = mediaList[i];
        if (this.isMediaSelected(media.name)){
            // for each connection
            for(var j = 0; j < media.interactions.length; j++){
                var connection = media.interactions[j];
                if (!this.selectedConnections.has(connection.p1)){
                    this.selectedConnections.set(connection.p1, new Set());
                }
                this.selectedConnections.get(connection.p1).add(
                {
                    "person":connection.p2,
                    "link":connection.desc,
                    "media":media.name
                });
                if (!this.selectedConnections.has(connection.p2)){
                    this.selectedConnections.set(connection.p2, new Set());
                }
                this.selectedConnections.get(connection.p2).add(
                {
                    "person":connection.p1,
                    "link":connection.desc,
                    "media":media.name
                });
            }
        }
    }
};