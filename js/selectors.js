function fillSelectors(){
	// populate the drop down menus
	createDropDownElement(mediaFrom,"All",false);
	createDropDownElement(mediaTo,"All",false);
	for (var i = 0; i < connectionGraph.categories.length; i++){
		var category = connectionGraph.categories[i];
		createDropDownElement(mediaFrom,category,true);
		createDropDownElement(mediaTo,category,true);
		for(var j=0; j < connectionGraph.properties.length; j++){
			var media = connectionGraph.properties[j];
			if(media.category == category){
				var name = media.name;
				createDropDownElement(mediaFrom,name,false);
				createDropDownElement(mediaTo,name,false);
			}
		}
	}
	updateSelector("mediaFrom","goFrom");
	updateSelector("mediaTo","goTo");
}

function updateSelector(mediaSelectId, charSelectId){
	var charSelect = document.getElementById(charSelectId);
	var mediaName = getSelectorValue(mediaSelectId);
	var characters;

	if(mediaName == "All"){
		characters = connectionGraph.characters;
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