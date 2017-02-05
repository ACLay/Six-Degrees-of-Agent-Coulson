var Coulson = Coulson || {};

Coulson.openTab = function(evt, tabId) {
	"use strict";
	// Declare all variables
	var i, tabcontent, tablinks;

	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}

	// Show the current tab, and add an "active" class to the link that opened the tab
	document.getElementById(tabId).style.display = "block";
	evt.currentTarget.className += " active";
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