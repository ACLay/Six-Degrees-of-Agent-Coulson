var Coulson = Coulson || {};

Coulson.generateFilters = function(){
	"use strict";
	var categories = this.connectionGraph.categories;
	var properties  = this.connectionGraph.properties;
	for(var i = 0; i < categories.length; i++){
		var category = categories[i];
		
		var categoryTag = this.makeCategoryTag(category);
		for(var j=0; j < properties.length; j++){
			var media = properties[j];
			if(media.category === category){
				//add media filter
				this.addMediaCheckbox(categoryTag,category,media.name);
			}
		}
	}
};

Coulson.categoryCheckboxes = new Map();
Coulson.mediaCheckboxes = new Map();

Coulson.makeCategoryTag = function(category){
	"use strict";
	var element = document.createElement("div");
	element.id = category + "_selectors";
	element.classList.add("category");

	var header = document.createElement("h3");
	var label = document.createElement("label");
	label.onclick = function(){
		Coulson.categoryCheckboxClicked(category);
	};
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = category + "_cb";
	checkbox.checked = true;
	this.categoryCheckboxes.set(category,{"category":checkbox,"media":[]});
	var text = document.createTextNode(category);
	
	var filters = document.getElementById("filters");
	var stanOptions = document.getElementById("stanOptions");
	
	filters.insertBefore(element,stanOptions);
	element.appendChild(header);
	header.appendChild(label);
	label.appendChild(checkbox);
	label.appendChild(text);
	return element;
};

Coulson.addMediaCheckbox = function(categoryTag, categoryName, mediaName){
	"use strict";
	var labelTag = document.createElement("label");

	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = mediaName + "_cb";
	checkbox.value = mediaName + "_cb";
	checkbox.checked = true;
	this.categoryCheckboxes.get(categoryName).media.push(checkbox);
	this.mediaCheckboxes.set(mediaName,checkbox);
	labelTag.onclick = function(){
		Coulson.mediaCheckboxClicked(categoryName);
	};

	var labelText = document.createTextNode(mediaName);

	labelTag.appendChild(checkbox);
	labelTag.appendChild(labelText);
	categoryTag.appendChild(labelTag);
};

Coulson.categoryContainsSelection = function(categoryName){
	"use strict";
	var categoryCheckbox = this.categoryCheckboxes.get(categoryName).category;
	return categoryCheckbox.checked || categoryCheckbox.indeterminate;
};

Coulson.isMediaSelected = function(mediaName){
	"use strict";
	return this.mediaCheckboxes.get(mediaName).checked;
};

Coulson.listCharactersFromSelectedMedia = function(){
	"use strict";
	return Array.from(this.selectedConnections.keys()).sort();
};

Coulson.categoryCheckboxClicked = function(categoryName){
	"use strict";
	var selected = this.categoryCheckboxes.get(categoryName).category.checked;
	var checkboxes = this.categoryCheckboxes.get(categoryName).media;
	for(var i=0; i < checkboxes.length; i++){
		checkboxes[i].checked = selected;
	}
	this.mapSelectedConnections();
	this.fillSelectors();
	this.updateMediaStatsTab();
};

Coulson.mediaCheckboxClicked = function(categoryName){
	"use strict";
	var categoryCheckbox = this.categoryCheckboxes.get(categoryName).category;
	var checkboxes = this.categoryCheckboxes.get(categoryName).media;
	var and = checkboxes[0].checked;
	var or = checkboxes[0].checked;
	for(var i=1; i < checkboxes.length; i++){
		and = and && checkboxes[i].checked;
		or = or || checkboxes[i].checked;
	}
	categoryCheckbox.checked = and;
	categoryCheckbox.indeterminate = !(and) && or;
	this.mapSelectedConnections();
	this.fillSelectors();
	this.updateMediaStatsTab();
};

Coulson.setAllCheckboxes = function(selected){
	"use strict";
	for (var categoryBoxes of this.categoryCheckboxes.values()){
		categoryBoxes.category.indeterminate = false;
		categoryBoxes.category.checked = selected;
		var mediaBoxes = categoryBoxes.media;
		for (var i = 0; i < mediaBoxes.length; i++){
			var mediaBox = mediaBoxes[i];
			mediaBox.checked = selected;
		}
	}
	this.mapSelectedConnections();
	this.fillSelectors();
	this.updateMediaStatsTab();
};