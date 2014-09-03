jQuery(document).ready(function($) {
	//Get the JSON with the x,y coords
	$.getJSON("data/xy.json", function(data){
		console.log(data);
		console.log(Object.keys(data));
		
		//Access the data with the object keys (unique ids)
		var keys = Object.keys(data);
		
		//Set up the dimensions of our svg drawing
		var width = 960, height = 800, margin = {left: 160, right: 160, top: 100, bottom: 100};
		
		//Find the min and max values 
		var xMin = d3.min(keys, function(d){ return data[d][0]; }),
			xMax = d3.max(keys, function(d){ return data[d][0]; }),
			yMin = d3.min(keys, function(d){ return data[d][1]; }),
			yMax = d3.max(keys, function(d){ return data[d][1]; });		
		
		//Set up the scale on the x-axis using the min and max x values
		var xScale = d3.scale.linear()
		  			   .domain([xMin, xMax])
		  			   .range([margin.left, width - margin.right]);

		//Set up the scale on the y-axis using the min and max y values
		var yScale = d3.scale.linear()
					   .domain([yMin, yMax])
					   .range([margin.top, height - margin.bottom]);
		
		//Draw a circle for each data point
		 var svg = d3.select("svg")
		  .selectAll("circle")
	      .data(keys)
	      .enter()
	      .append("circle")
	      .attr("class", "dot")
	      .attr("r", 3.5) //3.5 pixel radius
	      //Use our x and y scales that were created earlier to find the pixel value of the coordinates
	      .attr("transform", function(d) { return "translate(" + xScale(data[d][0]) + "," + yScale(data[d][1]) + ")"; });
		 
		 // TODO: Look up this unique id (d) in the table.tab file and find it's corresponding category value (e.g. 25).
		 // Then find the color associated with that category value by looking it up in a category -> color map (to be created)
		 //
	});
		
});

