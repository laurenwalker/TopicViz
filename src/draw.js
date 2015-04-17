//Wait for the document to be ready
jQuery(document).ready(function($) {
	/**
	 *  ======== OPTIONS =======
	 */
	
	
	/** Pull in all of the data first 
	* We have three sources of data
	*	- Top16Terms.tab: The definition of our top 20 categories - A list of the category ID and it's associated terms
	*	- xy_top100.json: The starting x,y position for each node, in JSON. The format is:
	*		- { nodeKey: [x, y] }
	*	- table.tsv: The full table with all information about each node. Will get pulled in as an array of nodes objects. 
	*/
	d3.tsv("data/Top16Terms.tab", function(error, terms) {
		$.getJSON("data/xy_top100.json", function(coords){
			d3.tsv("data/filtered_table.txt", function(err, table){
				
				//Get the column names from the terms data
				categoryID = Object.keys(terms[0])[0];
				
				//Set up some basic configuration for the SVG
				var width  = 830,
				    height = 830,
				    scale = configuration.scale || 1,
				    radius = Math.min(width, height) / 2,
				    arcWidth = (Math.PI * 2 * radius)/terms.length;
				
				//Create the SVG element and center it in it's parent element
				var svg = d3.select(configuration.parentEl || "body").append("svg")
				    .attr("width",  width)
				    .attr("height", height)
				    .attr("viewBox", "0,0," + width + "," + height*scale)
				    .append("g")
				    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
				
				drawArcs();
				drawNodes();
				
				/*
				 * drawArcs creates the SVG and draws the donut shape with each of the categories as an equally-sized arc of the donut. 
				 */
				function drawArcs(){
					
					//Create a d3 arc shape with an inner and outer radius
					var arc = d3.svg.arc()
					    .outerRadius(radius)
					    .innerRadius(radius - (configuration.arcThickness || 70));
					
					//Create a d3 pie layout
					var pie = d3.layout.pie()
					    .value(function(d) { return 1; });
						
					  //Draw a group element to group our arcs
					  var g = svg.selectAll(".arc")
					      .data(pie(terms))
					      .enter().append("g")
					      .attr("class", "arcs");
					
					  //Draw the path for each arc
					  g.append("path")
					      .attr("d", arc)
					      .attr("class", "arc")
					      //Bind the categoryID to each arc so it is accessible via jQuery and d3
					      .attr("data-category", function(d){ return d.data[categoryID]; })
					      .attr("id", function(d){ return "arc-" + d.data[categoryID]; })
					      .style("fill", function(d) { 
					    	  //Find the color for this arc by finding it in the category->color map
					    	  return colors[d.data[categoryID]][0]; 
					    	})
					      //This will happen when a user clicks on an arc
				          .on("click", function(d){ 
				        	  selectCategory(this, d.data.categoryID);
					      });
					  
					  var labels = svg.selectAll(".arc-label")
								      .data(categoryLabels)
								      .enter().append("g");
					  	
				    var idsAdded = new Array();
					labels.append("text")
						  .attr("class", "arc-label category-label")
						  .style("fill", function(d){
							  return colors[d.id][1];
						  })
						  .attr("dy", function(d){
							  var i = 0,
							  	  count = 0;
							  while(i > -1){
								  i = idsAdded.indexOf(d.id, i+count);
								  if(i > -1) count++;
							  }
							  idsAdded.push(d.id);
							  return 20 + (20*count);
						  })
						  .attr("dx", function(d){
							  //Determine the horizontal offset by finding the leftover space in the arc width and divinding by two, essentially "centering" the text
							  //Create a DOM element with the label text inside in order to get a pixel width
							  var span = $(document.createElement("span")).text(d.text).addClass("arc-label");
							  $("body").append(span);
							  var textWidth = $(span).width();
							  $(span).detach(); //remove it, it was only temporary
							  
							  var xOffset = (arcWidth - textWidth)/2;
							  if(xOffset < 0) return 0;
							  else return xOffset;
						  })
						  .attr("data-category", function(d){
							  return d.id;
						  })
						  .on("click", function(d){
							//Get the arc path that corresponds to this label
							selectCategory(document.getElementById("arc-" + d.id), d.id);
						  })
						  .append("textPath")
				   	      .text(function(d) { 
				   	         return d.text;
						  })
						  .attr("xlink:href", function(d){ return "#arc-" + d.id; });
				}

				function drawNodes(){			
						
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
					//var margin = {left: 100, right: 100, top: 100, bottom: 100},
					var	padding = 2, // separation between same-color nodes
				    	clusterPadding = 4, // separation between different-color nodes
				    	maxRadius = 4;
					
					//Find the min and max values 
					var xMin = d3.min(keys, function(d){ return coords[d][0]; }),
						xMax = d3.max(keys, function(d){ return coords[d][0]; }),
						yMin = d3.min(keys, function(d){ return coords[d][1]; }),
						yMax = d3.max(keys, function(d){ return coords[d][1]; });		
					
					//Set up the scale on the x-axis using the min and max x values
					/*var xScale = d3.scale.linear()
					  			   .domain([xMin, xMax])
					  			   .range([margin.left, width - margin.right]);
			
					//Set up the scale on the y-axis using the min and max y values
					var yScale = d3.scale.linear()
								   .domain([yMin, yMax])
								   .range([margin.top, height - margin.bottom]);*/
					  
					var n = keys.length, // total number of nodes
				    	m = 16; // number of distinct clusters
				
					var force = d3.layout.force()
								   .nodes(nodes)
								   .size([width, height])
								   .gravity(.60)
								 //.charge(50)
								 //.chargeDistance(10)
								 //.theta(.01)
								   .on("tick", tick)
								   .start();

					//Start the timeout so the animation doesn't last forever
					var timeout = window.setTimeout(start, 10000);
					
					var nodeGroup = svg.append("g")
					                   .attr("class", "node-group")
					                   .attr("transform", "translate(" + width/-2 + "," + height/-2 + ")");
					
					var node = nodeGroup.selectAll("circle")
				    			  .data(nodes)
				                  .enter().append("circle")
				  	              .attr("class", "node")
				  	              .attr("data-category", function(d){
				  	            	  return d.category;
				  	              })
				  	              .attr("data-key", function(d){
				  	            	  return d.key;
				  	              })
				  	              .style("fill", function(d) { return colors[d.color][0]; })
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
						force.stop();
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
					  node.each(cluster(10 * e.alpha * e.alpha))
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
			}
				
			function selectNodes(category){
				d3.selectAll(".node")
				 // .attr("r", 2);
				  .style("opacity", function(d){
					  var key = $(this).attr("data-key");
					  var row = $.grep(table, function(e){ return e.primaryKey == key; });
					  var categoryName = "lda020selected_topicWeights_" + category;
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
			
			function resetNodes(){
				d3.selectAll(".node")
				  .style("opacity", "1");
			}
			
			/*
			 * Select the specified category and "filter" the nodes related to that category
			 */
			function selectCategory(element, category){
				  //If this arc is already selected...
	        	  if(d3.select(element).classed("selected")){
	        		 
	        		  //Change all the other arc colors back to normal
	        		  $("path.arc").css("fill", function(){
	        			  return colors[$(this).attr("data-category")][0];
	        		  });
	        		  
	        		  //Change all the other arc labels back to normal
	        		  $(".arc-label").css("fill", function(){
	        			 return colors[$(this).attr("data-category")][1]; 
	        		  });
	        		  
	        		  //Make the new list of classes and add them
	        		  var newClasses = $(element).attr("class").replace("selected", "");
	        		  $(element).attr("class", newClasses);
	        		  
	        		  //Reset the nodes
	        		  resetNodes();
	        	  }
	        	  // If this is a new selection...
	        	  else{
	        		  //Select all the other arcs and color them as inactive
	        		  $("path.arc").css("fill", (configuration.inactiveArcColor || "#F0F0F0"));
	        		  $(".arc-label").css("fill", (configuration.inactiveLabelColor || "#999999"));
	        		  
	        		  //Select any other arc that is marked as "selected" and remove that class
	        		  $("path.arc.selected").each(function(i, arc){
	        			  var newClasses = $(arc).attr("class").replace("selected", "");
		    	          $(arc).attr("class", newClasses);
	        		  });
	        		  
	        		  //Then select the active arc and recolor it as its original color
	        		  var currentClasses = $(element).attr("class");
	        		  $(element)
	    	            .css("fill", colors[category][0])
	    	            .attr("class", currentClasses + " selected");
	        		  
	        		  //Find the arc label that goes with this arc and recolor it
	        		  $("[data-category='" + category + "'].arc-label")
	        		       .css("fill", colors[category][1]);
	        		  
	    	          //Call our function that will manipulate the nodes for this category
	        		  selectNodes(category);
	        	  }
			}
	
			});
		});
	});
});