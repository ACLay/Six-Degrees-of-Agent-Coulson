window.onload = function(){
	connectionGraph = getConnectionData();
	
	generateFilters();

	fillSelectors();

	var button = document.getElementById("findConnection");
	button.onclick = displayConnection;

	button = document.getElementById("showFilters");
	button.onclick = toggleFilterVisibility;

	button = document.getElementById("hideFilters");
	button.onclick = toggleFilterVisibility;
};