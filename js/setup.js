window.onload = function(){
	connectionGraph = getConnectionData();
	
	generateFilters();

	fillSelectors();

	var button = document.getElementById("findConnection")
	button.onclick = displayConnection;
};