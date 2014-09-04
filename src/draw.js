 
jQuery(document).ready(function($) {

	var table;
	
	drawArcs();
	drawNodes();
	
function drawArcs(){
	var width = 960,
	    height = 800,
	    radius = Math.min(width, height) / 2;
	
	var arc = d3.svg.arc()
	    .outerRadius(radius - 10)
	    .innerRadius(radius - 70);
	
	var pie = d3.layout.pie()
	    .sort(null)
	    .value(function(d) { return 1; });
	
	var svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	d3.tsv("data/Top16Terms.tab", function(error, data) {
	
	  //Draw a group element to group our arcs
	  var g = svg.selectAll(".arc")
	      .data(pie(data))
	      .enter().append("g")
	      .attr("class", "arc");
	
	  //Draw the path for each arc
	  g.append("path")
	      .attr("d", arc)
	      .attr("data-categoryegory", function(d){ return d.data["topic after removal"]; })
	      .style("fill", function(d) { 
	    	  //Find the color for this arc by finding it in the category->color map
	    	  return colors[d.data["topic after removal"]]; 
	    	})
          .on("click", function(d){ 
        	  if(d3.select(this).classed("selected")){
        		  //If this arc is already selected, de-select it
        		  svg.selectAll("path")
        		     .style("fill", function(path){
        		    	 return colors[path.data["topic after removal"]];
        		     });
        		  d3.select(this).classed("selected", false);
        	  }
        	  else{
        		  var category = d.data["topic after removal"];
        		  // If it's not selected yet, color the arc differently and then change the related nodes
        		  svg.selectAll("path").style("fill", "#F0F0F0");
    	          d3.select(this)
    	            .style("fill", colors[category])
    	            .classed("selected", true);  
    	          selectNodes(category);
        	  }
        	  // 
	    	});
	
	  //Draw a label on each arc
	  g.append("text")
	      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	      .attr("dy", ".35em")
	      .style("text-anchor", "middle")
	      .text(function(d) { 
	    	  var category = d.data["topic after removal"];
	    	  
	    	  return categories[category]; 
	       });
	
	});
}

function drawNodes(){
	//Get the JSON with the x,y coords
	$.getJSON("data/xy_top100.json", function(coords){
		d3.tsv("data/table.tsv", function(err, response){
			table = response;
			
			console.log(table);
			
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
					px: coords[key][0],
					py: coords[key][1],
					key: key,
					cluster: category100,
					category: category20,
					color: category20,
					radius: 4
				};
				if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
				nodes.push(d);
			});
			
			//Set up the dimensions of our svg drawing
			var width = 960, height = 800, margin = {left: 160, right: 160, top: 100, bottom: 100},
				padding = 2, // separation between same-color nodes
		    	clusterPadding = 4, // separation between different-color nodes
		    	maxRadius = 4;
			
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
		
		var force = d3.layout.force()
	    .nodes(nodes)
	    .size([width , height])
	    .gravity(.70)
	    //.charge(50)
	    //.chargeDistance(10)
	    //.theta(.01)
	    .on("tick", tick)
	    .start();
		
		var svg = d3.select("body").select("svg")
	    .attr("width", width)
	    .attr("height", height);
	
		//var timeout = window.setTimeout(start, 10000);
		
		var node = svg.selectAll("circle")
	    .data(nodes)
	  .enter().append("circle")
	  	.attr("class", "node")
	    .attr("data-category", function(d){
	  		return d.category;
	  	})
	  	.attr("data-key", function(d){
	  		return d.key;
	  	})
	    .style("fill", function(d) { return colors[d.color]; })
	   /* .attr("transform",  function(d){
	    	console.log("plotting");
	    	var value = "translate(";
	    	value += xScale(d.x);
	    	value += ",";
	    	value += yScale(d.y);
	    	value += ")";
	    	return value;
	    }); */
	    //.call(force.drag);
		
		function start(){
			force.start();
			window.clearTimeout(timeout);
		}

		//force.start();
		
	node.transition()
	    .duration(5)
	    .delay(function(d, i) { return i * 2; })
	    .attrTween("r", function(d) {
	      var i = d3.interpolate(0, d.radius);
	      return function(t) { return d.radius = i(t); };
	    });
	
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
}

function selectNodes(category){
	d3.selectAll(".node")
	 // .attr("r", 2);
	  .style("opacity", function(d){
		  console.log("click");
		  var key = $(this).attr("data-key");
		  var row = $.grep(table, function(e){ return e.primaryKey == key; });
		  var categoryName = "lda020selected_topicWeights_ " + category;
		  return row[0][categoryName];
	  });
	
	/*d3.selectAll("[data-category='"+category+"']")
	  .attr("r", function(d){
		  return 6;
	  })
	  .attr("stroke", "#FFFFFF")
	  .attr("stroke-width", "2")
	  .style("opacity", function(d){
		  var key = $(this).attr("data-key");
		  var row = $.grep(table, function(e){ return e.primaryKey == key; });
		  var categoryName = "lda020selected_topicWeights_ " + category;
		  console.log(row[0][categoryName]);
		  return row[0][categoryName];
	  });*/
	
}
	
	
});