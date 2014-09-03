jQuery(document).ready(function($) {
	
	//Get the JSON with the x,y coords
	$.getJSON("data/xy_top100.json", function(coords){
		d3.tsv("data/table.tsv", function(err, table){
		
			console.log(table);
			console.log(coords);
			console.log(Object.keys(coords));
		
			//Access the data with the object keys (unique ids)
			var keys = Object.keys(coords);
			
			var nodes = [];
			// The largest node for each cluster.
			var clusters = new Array(m);
			
			//Make an array of the coords
			$.each(keys, function(i, key){
				var node = $.grep(table, function(e){ return e.primaryKey == key; });
				var category100 = node[0].maxtopic100selected_id;
				var category20 = node[0].maxtopic20selected_id;
				
				var d = {
					x: coords[key][0],
					y: coords[key][1],
					key: key,
					cluster: category100,
					color: category20,
					radius: 3.5
				};
				if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
				nodes.push(d);
			});
			
			//Set up the dimensions of our svg drawing
			var width = 960, height = 800, margin = {left: 160, right: 160, top: 100, bottom: 100};
			var padding = 1, // separation between same-color nodes
		    clusterPadding = 10, // separation between different-color nodes
		    maxRadius = 12;
			
			//Find the min and max values 
			var xMin = d3.min(keys, function(d){ return coords[d][0]; }),
				xMax = d3.max(keys, function(d){ return coords[d][0]; }),
				yMin = d3.min(keys, function(d){ return coords[d][1]; }),
				yMax = d3.max(keys, function(d){ return coords[d][1]; });		
			
			//Set up the scale on the x-axis using the min and max x values
			var xScale = d3.scale.linear()
			  			   .domain([xMin, xMax])
			  			   .range([margin.left, width - margin.right]);
	
			//Set up the scale on the y-axis using the min and max y values
			var yScale = d3.scale.linear()
						   .domain([yMin, yMax])
						   .range([margin.top, height - margin.bottom]);
			  
			var n = keys.length, // total number of nodes
		    	m = 16; // number of distinct clusters


		/*var nodes = d3.range(n).map(function() {
		  var i = Math.floor(Math.random() * m),
		      r = 3.5,
		      d = {
		        cluster: i,
		        radius: r,
		        x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
		        y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
		      };
		  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
		  return d;
		});*/
		
		var force = d3.layout.force()
	    .nodes(nodes)
	    .size([width, height])
	    .gravity(.02)
	    .charge(0)
	    .chargeDistance(10)
	    .theta(.01)
	    .on("tick", tick)
	    .start();
		
		var svg = d3.select("body").select("svg")
	    .attr("width", width)
	    .attr("height", height);

		var node = svg.selectAll("circle")
	    .data(nodes)
	  .enter().append("circle")
	    .style("fill", function(d) { return colors[d.color]; })
	    .call(force.drag);

	node.transition()
	    .duration(5)
	    .delay(function(d, i) { return i * 2; })
	    .attrTween("r", function(d) {
	      var i = d3.interpolate(0, d.radius);
	      return function(t) { return d.radius = i(t); };
	    });
			
			//Draw a circle for each data point
	/*		 var circles = d3.select("svg")
			  .selectAll("circle")
		      .data(table)
		      .enter()
		      .append("circle")
		      .attr("class", "dot")
		      .attr("r", 3.5) //3.5 pixel radius
		      //Use our x and y scales that were created earlier to find the pixel value of the coordinates
		      .attr("transform", function(d) { 
		    	  //Get the coordinates for this point using the key
		    	  var x = coords[d.primaryKey][0],
		    	  	  y = coords[d.primaryKey][1];
		    	  return "translate(" + xScale(x) + "," + yScale(y) + ")"; 
		       })
		       .attr("x", function(d){ return xScale(coords[d.primaryKey][0]); })
		       .attr("y", function(d){ return yScale(coords[d.primaryKey][1]); })
		      .attr("fill", function(d){ 
		    	  var category = d.maxtopic20selected_id,
		    	  	  color = colors[category];
		    	  return color;
		      })
		      .call(force.drag);
		*/

			function tick(e) {
			  node
			      .each(cluster(10 * e.alpha * e.alpha))
			      .each(collide(.5))
			      .attr("cx", function(d) { return d.x; })
			      .attr("cy", function(d) { return d.y; });
			}

			// Move d to be adjacent to the cluster node.
			function cluster(alpha) {
			  return function(d) {
			    var cluster = clusters[d.cluster];
			    if (cluster === d) return;
			    var x = d.x - cluster.x,
			        y = d.y - cluster.y,
			        l = Math.sqrt(x * x + y * y),
			        r = d.radius + cluster.radius;
			    if (l != r) {
			      l = (l - r) / l * alpha;
			      d.x -= x *= l;
			      d.y -= y *= l;
			      cluster.x += x;
			      cluster.y += y;
			    }
			  };
			}

			// Resolves collisions between d and all other circles.
			function collide(alpha) {
			  var quadtree = d3.geom.quadtree(nodes);
			  return function(d) {
			    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
			        nx1 = d.x - r,
			        nx2 = d.x + r,
			        ny1 = d.y - r,
			        ny2 = d.y + r;
			    quadtree.visit(function(quad, x1, y1, x2, y2) {
			      if (quad.point && (quad.point !== d)) {
			        var x = d.x - quad.point.x,
			            y = d.y - quad.point.y,
			            l = Math.sqrt(x * x + y * y),
			            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
			        if (l < r) {
			          l = (l - r) / l * alpha;
			          d.x -= x *= l;
			          d.y -= y *= l;
			          quad.point.x += x;
			          quad.point.y += y;
			        }
			      }
			      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			    });
			  };
			}
		});
	});	
});

