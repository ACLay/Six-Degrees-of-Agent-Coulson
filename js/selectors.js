var Coulson = Coulson || {};

Coulson.fillSelectors = function(){
	"use strict";
	// preserve the selected values
	var previousMediaFrom = this.getSelectorValue("mediaFrom");
	var previousMediaTo = this.getSelectorValue("mediaTo");
	var previousMediaRoot = this.getSelectorValue("rootMedia");
	var previousMediaDistance = this.getSelectorValue("distanceMedia");
	var previousCharFrom = this.getSelectorValue("goFrom");
	var previousCharTo = this.getSelectorValue("goTo");
	var previousCharRoot = this.getSelectorValue("rootCharacter");
	var previousCharDistance = this.getSelectorValue("distanceCharacter");

	var mediaFrom = document.getElementById("mediaFrom");
	var mediaTo = document.getElementById("mediaTo");
	var rootMedia = document.getElementById("rootMedia");
	var distanceMedia = document.getElementById("distanceMedia");

	// populate the drop down menus
	this.removeChildren(mediaFrom);
	this.removeChildren(mediaTo);
	this.removeChildren(rootMedia);
	this.removeChildren(distanceMedia);
	this.createDropDownElement(mediaFrom,"All",false);
	this.createDropDownElement(mediaTo,"All",false);
	this.createDropDownElement(rootMedia,"All",false);
	this.createDropDownElement(distanceMedia,"All",false);
	for (var i = 0; i < this.connectionGraph.categories.length; i++){
		var category = this.connectionGraph.categories[i];
		if (this.categoryContainsSelection(category)){
			this.createDropDownElement(mediaFrom,category,true);
			this.createDropDownElement(mediaTo,category,true);
			this.createDropDownElement(rootMedia,category,true);
			this.createDropDownElement(distanceMedia,category,true);
			for(var j=0; j < this.connectionGraph.properties.length; j++){
				var media = this.connectionGraph.properties[j];
				if(this.isMediaSelected(media.name)){
					if(media.category === category){
						var name = media.name;
						this.createDropDownElement(mediaFrom,name,false);
						this.createDropDownElement(mediaTo,name,false);
						this.createDropDownElement(rootMedia,name,false);
						this.createDropDownElement(distanceMedia,name,false);
					}
				}
			}
		}
	}

	this.setSelectionIfPresent("mediaFrom", previousMediaFrom);
	this.setSelectionIfPresent("mediaTo", previousMediaTo);
	this.setSelectionIfPresent("rootMedia", previousMediaRoot);
	this.setSelectionIfPresent("distanceMedia", previousMediaDistance);

	this.updateSelector("mediaFrom","goFrom");
	this.updateSelector("mediaTo","goTo");
	this.updateSelector("rootMedia","rootCharacter");
	this.updateSelector("distanceMedia","distanceCharacter");

	this.setSelectionIfPresent("goFrom", previousCharFrom);
	this.setSelectionIfPresent("goTo", previousCharTo);
	this.setSelectionIfPresent("rootCharacter", previousCharRoot);
	this.setSelectionIfPresent("distanceCharacter", previousCharDistance);

	// Only show the root character selector when needed
	var selectedCharacterCount = this.selectedConnections.size;
	var rootSelectors = document.getElementById("rootSelectors");
	if (selectedCharacterCount === 0){
		this.setHidden(rootSelectors, true);
	} else {
		var reachableCharacterCount = this.findConnectedCharacters(this.getSelectorValue("rootCharacter")).length;
		this.setHidden(rootSelectors, selectedCharacterCount === reachableCharacterCount);
	}
};

Coulson.updateSelector = function(mediaSelectId, charSelectId){
	"use strict";
	var charSelect = document.getElementById(charSelectId);
	var mediaName = this.getSelectorValue(mediaSelectId);
	var characters;
	var i;

	if(mediaName === "All"){
		characters = this.listCharactersFromSelectedMedia();
	} else {
		for(i = 0; i < this.connectionGraph.properties.length; i++){
			var media = this.connectionGraph.properties[i];
			var name = media.name;
			if (mediaName === name){
				characters = media.characters;
				break;
			}
		}
	}

	this.removeChildren(charSelect);
	for(i = 0; i < characters.length; i++){
		this.createDropDownElement(charSelect, characters[i], false);
	}
};

Coulson.createDropDownElement = function(parent, name, disabled){
	"use strict";
	var element = document.createElement("option");
	element.textContent = name;
	element.value = name;
	element.disabled = disabled;
	parent.appendChild(element);
};

Coulson.setSelectionIfPresent = function(selectorId, value){
	"use strict";
	var selector = document.getElementById(selectorId);
	var children = selector.children;
	for (var i = 0; i < children.length; i++){
		var child = children[i];
		if (child.value === value){
			selector.selectedIndex = i;
			return;
		}
	}
};

Coulson.getSelectorValue = function(selectorId){
	"use strict";
	var selector = document.getElementById(selectorId);
	var index = selector.selectedIndex;
	if (index === -1) {
		return "";
	}
	return selector.options[index].value;
};