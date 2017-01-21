"use strict";

function generateFilters(){
	var categories = connectionGraph.categories;
	var properties  = connectionGraph.properties;
	for(var i = 0; i < categories.length; i++){
		var category = categories[i];
		
		var categoryTag = makeCategoryTag(category);
		//addCategoryToggleButtons(categoryTag,category);
		for(var j=0; j < properties.length; j++){
			var media = properties[j];
			if(media.category == category){
				//add media filter
				addMediaCheckbox(categoryTag,category,media.name);
			}
		}
	}
}

var categoryCheckboxes = new Map();
var mediaCheckboxes = new Map();

function makeCategoryTag(category){
	var element = document.createElement("div");
	element.id = category + "_selectors";
	element.classList.add("category");

	var header = document.createElement("h3");
	var label = document.createElement("label");
	label.setAttribute("onclick", "categoryCheckboxClicked('"+category+"')");
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = category + "_cb";
	checkbox.checked = true;
	categoryCheckboxes.set(category,{"category":checkbox,"media":[]})
	var text = document.createTextNode(category);
	
	filters.insertBefore(element,stanOptions);
	element.appendChild(header);
	header.appendChild(label);
	label.appendChild(checkbox);
	label.appendChild(text);
	return element;
}

function addMediaCheckbox(categoryTag, categoryName, mediaName){
	var labelTag = document.createElement("label");

	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = mediaName + "_cb";
	checkbox.value = mediaName + "_cb";
	checkbox.checked = true;
	categoryCheckboxes.get(categoryName).media.push(checkbox);
	mediaCheckboxes.set(mediaName,checkbox);
	labelTag.setAttribute("onclick", "mediaCheckboxClicked('"+categoryName+"')");

	var labelText = document.createTextNode(mediaName);

	labelTag.appendChild(checkbox);
	labelTag.appendChild(labelText);
	categoryTag.appendChild(labelTag);
}

function categoryContainsSelection(categoryName){
	var categoryCheckbox = categoryCheckboxes.get(categoryName).category;
	return categoryCheckbox.checked || categoryCheckbox.indeterminate;
}

function isMediaSelected(mediaName){
	return mediaCheckboxes.get(mediaName).checked;
}

function listCharactersFromSelectedMedia(){
	var characters = new Set();
	for(var i=0; i < connectionGraph.properties.length; i++){
		var media = connectionGraph.properties[i];
		var name = media.name;
		if (isMediaSelected(name)){
			for(var j=0; j < media.characters.length; j++){
				characters.add(media.characters[j]);
			}
		}
	}
	return Array.from(characters).sort()
}

function categoryCheckboxClicked(categoryName){
	var selected = categoryCheckboxes.get(categoryName).category.checked;
	var checkboxes = categoryCheckboxes.get(categoryName).media;
	for(var i=0; i < checkboxes.length; i++){
		checkboxes[i].checked = selected;
	}
	fillSelectors();
	updateMediaStatsTab();
}

function mediaCheckboxClicked(categoryName){
	var categoryCheckbox = categoryCheckboxes.get(categoryName).category;
	var checkboxes = categoryCheckboxes.get(categoryName).media;
	var and = checkboxes[0].checked;
	var or = checkboxes[0].checked;
	for(var i=1; i < checkboxes.length; i++){
		and = and && checkboxes[i].checked;
		or = or || checkboxes[i].checked;
	}
	categoryCheckbox.checked = and;
	categoryCheckbox.indeterminate = !(and) && or;
	fillSelectors();
	updateMediaStatsTab();
}

function setAllCheckboxes(selected){
	for (var [name, categoryBoxes] of categoryCheckboxes){
		categoryBoxes.category.indeterminate = false;
		categoryBoxes.category.checked = selected;
		var mediaBoxes = categoryBoxes.media
		for (var i = 0; i < mediaBoxes.length; i++){
			var mediaBox = mediaBoxes[i];
			mediaBox.checked = selected;
		}
	}
	fillSelectors();
	updateMediaStatsTab();
}