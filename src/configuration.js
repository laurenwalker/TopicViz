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
 		  1:"Statistics and modeling",
 		  2:"Conservation",
		  3:"Management" ,
		  4:"Marine ecology",
		  5:"Community ecology and biodiversity",
		  6:"Climate Change",
		  7:"pollination and dispersal",
		  8:"population ecology",
		  9:"biogeography and scaling rules",
		  10:"ecosystem ecology",
		  11:"trophic interactions",
		  12:"paleoecology", 
		  13:"evolutionary ecology",
		  14:"forest ecology???",
		  15:"disturbance and invasive species",
		  16:"pathogens and parasites"
	}
	
	var configuration = {
		scale: 1, //The higher the scale, the smaller the drawing. A scale of '2' would halve the size.
		arcThickness: 70,
		parentEl: "body",
		inactiveArcColor: "#F0F0F0"
	}