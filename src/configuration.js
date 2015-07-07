/**
 *  ======== CONFIGURATION =======
 */
// Set up the category colors 
//The first color is the arc background color. The second color is the label text color.
var colors = {
		1: "#33a047",
		2: "#1f78b4",
		3: "#6a3e98",
		4: "#e11e25",
		5: "#f47e1f",
		6: "#b15928",
		7: "#fcbe6e",
		8: "#f59899",
		9: "#ed5655",
		10: "#ba9898",
		11: "#9977b5",
		12: "#c9b2d6",
		13: "#a6cde2",
		14: "#faf39b",
		15: "#b3d78a",
		16: "#65a998"
}

// Create unique names for each category that summarize the list of terms
var categoryLabels = [
	  {id: 1,
	   text: "Informatics, Models"},
	  {id: 1, 
	   text: "and Analytics"},
	  {id: 2,
	   text: "Biodiversity"},
	  {id: 2,
	   text: "Conservation"},
	  {id: 3,
	   full: "Ecosystem Services",
	   text: "Ecosystem Services"},
	  {id: 4,
	   text: "Marine Ecology"}, 
	  {id: 4,
	   text: "and Resources"},
	  {id: 5,
	   full: "Community Ecology",
	   text: "Community Ecology"},
	  {id: 6,
	   text: "Ecological Effects"},
	  {id: 6,
	   text: "of Climate Change"},
	  {id: 7,
	   text: "Landscape Ecology"},
	  {id: 8,
	   text: "Population"},
	  {id: 8,
	   text: "Dynamics"},
	   {id: 9,
	   text: "Biogeography"},
	  {id: 10,
	   text: "Nutrient Cycling"},
	  {id: 10,
	   text: "and Productivity"},
	  {id: 11,
	   text: "Foodweb Ecology"},
	  {id: 12,
	   text: "Paleoecology"},
	  {id: 13,
	   text: "Evolution"},
	  {id: 14,
	   text: "Forest Ecology"},
	  {id: 15,
	   text: "Disturbances and"},
	  {id:15,
	   text: "Invasive Species"},
	  {id: 16,
	   text: "Infectious Disease"}
];

//The filter categories map from displayed filter name -> table column (separated by spaces)
var filterNameMap = {
	person : "Project_Pis AU",
	keyword : "AB_Updated summary_for_TM TI Title_for_TM"
}

var configuration = {
	scale: 1, //The higher the scale, the smaller the drawing. A scale of '2' would halve the size.
	arcThickness: 50,
	parentEl: "body",
	inactiveArcColor: "#F0F0F0",
	parentEl: "#svg-container",
	theme: "black", //Can be "white" or "black" (default)
	tooltipWidth: 270	
}