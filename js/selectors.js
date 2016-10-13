function fillSelectors(){
	// populate the drop down menus
	for(var i=0; i < connectionGraph.properties.length; i++){
		var media = connectionGraph.properties[i];
		var name = media.name;
		createDropDownElement(mediaFrom,name,false);
		createDropDownElement(mediaTo,name,false);
	}
	updateSelector("mediaFrom","goFrom");
	updateSelector("mediaTo","goTo");
}

function updateSelector(mediaSelectId, charSelectId){
	var charSelect = document.getElementById(charSelectId);
	var mediaName = getSelectorValue(mediaSelectId);

	for(var i=0; i < connectionGraph.properties.length; i++){
		var media = connectionGraph.properties[i];
		var name = media.name;
		if (mediaName == name){
			removeChildren(charSelect);
			for(var j=0; j < media.characters.length; j++){
				var opt = media.characters[j];
				createDropDownElement(charSelect, opt, false);
			}
			return;
		}
	}
};

function createDropDownElement(parent, name, disabled){
	var element = document.createElement("option");
	element.textContent = name;
	element.value = name;
	element.disabled = disabled;
	parent.appendChild(element);
};