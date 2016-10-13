window.onload = function(){
	connectionGraph = getConnectionData();

	fillSelectors();

	var button = document.getElementById("findConnection")
	button.onclick = displayConnection;
};