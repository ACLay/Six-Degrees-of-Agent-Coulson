var Coulson = Coulson || {};

Coulson.openTab = function(tabContentId, tabLinkId) {
	"use strict";
	var i;
	// Get all elements with class="tabcontent" and only show the selected one
	var tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		if (tabcontent[i].id === tabContentId){
			tabcontent[i].style.display = "block";
		} else {
			tabcontent[i].style.display = "none";
		}
	}

	// Get all the tablinks and set the "active" class where needed
	var tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
		if (tablinks[i].id === tabLinkId){
			tablinks[i].className += " active";
		}
	}
};

Coulson.removeChildren = function(element){
	"use strict";
	while (element.firstChild){
		element.removeChild(element.firstChild);
	}
};

Coulson.addChild = function(parent, tag, content){
	"use strict";
	var child = document.createElement(tag);
	child.textContent = content;
	parent.appendChild(child);
};

Coulson.setHidden = function(element, hidden){
	"use strict";
	if(hidden){
		element.classList.add("hidden");
	} else {
		element.classList.remove("hidden");
	}
};