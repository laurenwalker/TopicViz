	/**
	 *  ======== CONFIGURATION =======
	 */
	// Set up the category colors 
	var colors = {
			1: "#a6cee3",
			2: "#1f78b4",
			3: "#b2df8a",
			4: "#33a02c",
			5: "#fb9a99",
			6: "#e31a1c",
			7: "#fdbf6f",
			8: "#ff7f00",
			9: "#cab2d6",
			10: "#6a3d9a",
			11: "#ffff99",
			12: "#b15928",
			13: "#66AA99",
			14: "#BB9999",
			15: "#EE5555",
			16: "#9977BB"
	}
	
	// Create unique names for each categroy that summarize the list of terms
	var categories = {
 		  1:"Informatics, Modeling & Analytics",
 		  2:"Biodiversity Conservation & Management",
		  3:"Ecosystem Services" ,
		  4:"Marine Ecology and Resources Management",
		  5:"Community Ecology",
		  6:"Ecological Effects of Climate Change",
		  7:"Landscape Ecology",
		  8:"Population Dynamics",
		  9:"Biogeography",
		  10:"Nutrient Cycling and Productivity",
		  11:"Foodweb Ecology",
		  12:"Paleoecology", 
		  13:"Evolution",
		  14:"Forest Ecology",
		  15:"Disturbances and Invasive Species",
		  16:"Infectious Disease"
	}
	
	var configuration = {
		scale: 1, //The higher the scale, the smaller the drawing. A scale of '2' would halve the size.
		arcThickness: 70,
		parentEl: "body",
		inactiveArcColor: "#F0F0F0"
	}