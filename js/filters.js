function generateFilters(){
	var categories = connectionGraph.categories;
	var properties  = connectionGraph.properties;
	for(var i = 0; i < categories.length; i++){
		var category = categories[i];
		
		var categoryTag = makeCategoryTag(category);
		for(var j=0; j < properties.length; j++){
			var media = properties[j];
			if(media.category == category){
				//add media filter
				addMediaCheckbox(categoryTag,media.name);
			}
		}

	}
}

function makeCategoryTag(category){
	var element = document.createElement("div");
	element.id = category + "_selectors";
	element.class = "category";
	var header = document.createElement("h3");
	header.textContent = category;
	filters.appendChild(element);
	element.appendChild(header);
	return element;
}

function addMediaCheckbox(categoryTag, mediaName){
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = mediaName + "_cb";
	checkbox.value = mediaName + "_cb";
	checkbox.checked = true;
	checkbox.onclick = fillSelectors;
	categoryTag.appendChild(checkbox);

	var label = document.createTextNode(mediaName);
	categoryTag.appendChild(label);

	var newline = document.createElement("br");
	categoryTag.appendChild(newline);
}

function categoryContainsSelection(category){
	var categoryTag = document.getElementById(category + "_selectors");
	var children = categoryTag.children;
	for (var i = 1; i < children.length; i = i+2){
		if (children[i].checked){
			return true;
		}
	}
	return false;
}

function isMediaSelected(mediaName){
	return document.getElementById(mediaName + "_cb").checked;
}