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
	var labelTag = document.createElement("label");

	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = mediaName + "_cb";
	checkbox.value = mediaName + "_cb";
	checkbox.checked = true;
	labelTag.onclick = fillSelectors;

	var labelText = document.createTextNode(mediaName);

	labelTag.appendChild(checkbox);
	labelTag.appendChild(labelText);
	categoryTag.appendChild(labelTag);
}

function categoryContainsSelection(category){
	for(var i = 0; i < connectionGraph.properties.length; i++){
		var property = connectionGraph.properties[i];
		if(property.category == category){
			if(isMediaSelected(property.name)){
				return true;
			}
		}
	}
	return false;
}

function isMediaSelected(mediaName){
	return document.getElementById(mediaName + "_cb").checked;
}