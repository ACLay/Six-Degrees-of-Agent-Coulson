"use strict";

function fillSelectors(){
	// preserve the selected values
	var previousMediaFrom = getSelectorValue("mediaFrom");
	var previousMediaTo = getSelectorValue("mediaTo");
	var previousMediaRoot = getSelectorValue("rootMedia");
	var previousCharFrom = getSelectorValue("goFrom");
	var previousCharTo = getSelectorValue("goTo");
	var previousCharRoot = getSelectorValue("rootCharacter");

	var mediaFrom = document.getElementById("mediaFrom");
	var mediaTo = document.getElementById("mediaTo");
	var rootMedia = document.getElementById("rootMedia");

	// populate the drop down menus
	removeChildren(mediaFrom);
	removeChildren(mediaTo);
	removeChildren(rootMedia)
	createDropDownElement(mediaFrom,"All",false);
	createDropDownElement(mediaTo,"All",false);
	createDropDownElement(rootMedia,"All",false);
	for (var i = 0; i < connectionGraph.categories.length; i++){
		var category = connectionGraph.categories[i];
		if (categoryContainsSelection(category)){
			createDropDownElement(mediaFrom,category,true);
			createDropDownElement(mediaTo,category,true);
			createDropDownElement(rootMedia,category,true);
			for(var j=0; j < connectionGraph.properties.length; j++){
				var media = connectionGraph.properties[j];
				if(isMediaSelected(media.name)){
					if(media.category == category){
						var name = media.name;
						createDropDownElement(mediaFrom,name,false);
						createDropDownElement(mediaTo,name,false);
						createDropDownElement(rootMedia,name,false);
					}
				}
			}
		}
	}

	setSelectionIfPresent("mediaFrom", previousMediaFrom);
	setSelectionIfPresent("mediaTo", previousMediaTo);
	setSelectionIfPresent("rootMedia", previousMediaRoot);

	updateSelector("mediaFrom","goFrom");
	updateSelector("mediaTo","goTo");
	updateSelector("rootMedia","rootCharacter");

	setSelectionIfPresent("goFrom", previousCharFrom);
	setSelectionIfPresent("goTo", previousCharTo);
	setSelectionIfPresent("rootCharacter", previousCharRoot);
}

function updateSelector(mediaSelectId, charSelectId){
	var charSelect = document.getElementById(charSelectId);
	var mediaName = getSelectorValue(mediaSelectId);
	var characters;

	if(mediaName == "All"){
		characters = listCharactersFromSelectedMedia();
	} else {
		for(var i=0; i < connectionGraph.properties.length; i++){
			var media = connectionGraph.properties[i];
			var name = media.name;
			if (mediaName == name){
				characters = media.characters;
				break;
			}
		}
	}

	removeChildren(charSelect);
	for(var i=0; i < characters.length; i++){
		createDropDownElement(charSelect, characters[i], false);
	}
};

function createDropDownElement(parent, name, disabled){
	var element = document.createElement("option");
	element.textContent = name;
	element.value = name;
	element.disabled = disabled;
	parent.appendChild(element);
};

function setSelectionIfPresent(selectorId, value){
	var selector = document.getElementById(selectorId);
	var children = selector.children;
	for (var i = 0; i < children.length; i++){
		var child = children[i]
		if (child.value == value){
			selector.selectedIndex = i;
			return;
		}
	}
};

function getSelectorValue(selectorId){
	var selector = document.getElementById(selectorId);
	var index = selector.selectedIndex;
	if (index == -1) { return "" }
	return selector.options[index].value;
};