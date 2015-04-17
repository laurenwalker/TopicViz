	/**
	 *  ======== CONFIGURATION =======
	 */
	// Set up the category colors 
	//The first color is the arc background color. The second color is the label text color.
	var colors = {
			1: ["#a6cee3", "rgb(0, 50, 90)"],
			2: ["#1f78b4", "rgb(217, 244, 255)"],
			3: ["#b2df8a", "rgb(3, 85, 0)"],
			4: ["#33a02c", "rgb(4, 63, 0)"],
			5: ["#fb9a99", "rgb(104, 6, 6)"],
			6: ["#e31a1c", "rgb(255, 204, 198)"],
			7: ["#fdbf6f", "rgb(66, 42, 0)"],
			8: ["#ff7f00", "rgb(255, 245, 216)"],
			9: ["#cab2d6", "rgb(22, 0, 20)"],
			10: ["#6a3d9a", "rgb(243, 229, 255)"],
			11: ["#ffff99", "#717174"],
			12: ["#b15928", "rgb(70, 50, 0)"],
			13: ["#66AA99", "rgb(0, 59, 14)"],
			14: ["#BB9999", "rgb(33, 29, 33)"],
			15: ["#EE5555", "rgb(84, 0, 0)"],
			16: ["#9977BB", "rgb(42, 0, 78)"]
	}
	
	// Create unique names for each category that summarize the list of terms
	var categoryLabels = [
 		  {id: 1,
 		   text: "Informatics, Models"},
 		  {id: 1, 
 		   text: "& Analytics"},
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
	
	var configuration = {
		scale: 1, //The higher the scale, the smaller the drawing. A scale of '2' would halve the size.
		arcThickness: 50,
		parentEl: "body",
		inactiveArcColor: "#F0F0F0",
		inactiveLabelColor: "#999999"
	}