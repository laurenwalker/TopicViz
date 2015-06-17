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
	*	- filtered_table: The full table with (almost) all information about each node. Will get pulled in as an array of nodes objects. 
	*/
	d3.tsv("data/Top16Terms.tab", function(error, terms) {
		$.getJSON("data/xy_top100.json", function(coords){
			d3.tsv("data/filtered_table.txt", function(err, table){
				
				//Get the column names from the terms data
				var categoryID = Object.keys(terms[0])[0];
				
				//Which theme are we using?
				var theme = configuration.theme || "black";
				$("body").addClass(theme);
				
				//Set up some basic configuration for the SVG
				var width  = 830,
				    height = 830,
				    scale = configuration.scale || 1,
				    radius = Math.min(width, height) / 2,
				    arcWidth = (Math.PI * 2 * radius)/terms.length;
				
				//Create the SVG element and center it in it's parent element
				var svg = d3.select(configuration.parentEl || "body").append("svg")
					.attr("xmlns", "http://www.w3.org/2000/svg")
				    .attr("width",  width)
				    .attr("height", height)
				    .attr("viewBox", "0,0," + width + "," + height*scale);
				
				//write intro text
      		     var intro = document.getElementById("introtext").innerHTML;
        		 $("#sidetext").html(intro);
				
				drawArcs();
				drawNodes();
				setupFilters();				
				
				//================ FUNCTIONS =======================
				
				/************************************************************************************
				 * Draw Arcs - creates the SVG and draws the donut shape with each of the categories as an equally-sized arc of the donut. 
				 *************************************************************************************/
				function drawArcs(){
					
					//Create a d3 arc shape with an inner and outer radius
					var arc = d3.svg.arc()
					    .outerRadius(radius)
					    .innerRadius(radius - (configuration.arcThickness || 70));
					
					//Create a d3 pie layout
					var pie = d3.layout.pie()
					    .value(function(d) { return 1; })
					    .sort(null);
						
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
					    	  return colors[d.data[categoryID]]; 
					    	})
					      //This will happen when a user clicks on an arc
				          .on("click", function(d){ 
				        	  selectCategory(this, d.data.categoryID);
					      })
					      .attr("transform", "translate(" + width/2 + ", " + height/2 + ")");
					  
					  var labels = svg.selectAll(".arc-label")
								      .data(categoryLabels)
								      .enter().append("g");
					  	
				    var idsAdded = new Array();
					labels.append("text")
						  .attr("class", "arc-label category-label")
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

				/************************************************************************************
				 * Draw Nodes - creates a circle or square "node" for each row in the table (products and projects) with a bouncing-in animation 
				 *************************************************************************************/
				function drawNodes(){			
						
					//Access the data with the object keys (unique ids)
					var keys = Object.keys(coords);
					
					var tooltipVisible = false;
					
					var nodes = [];
					// The largest node for each cluster.
					var clusters = new Array(m);
					
					//************** Make an array of the coords ************//
					$.each(keys, function(i, key){
						var node = $.grep(table, function(e){ return e.primaryKey == key; });
						var category100 = node[0].maxtopic100selected_id;
						var category20 = node[0].maxtopic20selected_id;
						var isProduct = (node[0].product_oid.length > 0)? true : false;
						
						var d = {
							x: coords[key][0],
							y: coords[key][1],
							px: coords[key][0],
							py: coords[key][1],
							key: key,
							cluster: category100,
							category: category20,
							color: category20,
							radius: 4,
							isProduct: isProduct,
							shape: 'rect'
						};
						if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
						nodes.push(d);
					});
					
					//************************** Draw the nodes ************************//
					//Set up the dimensions of our svg drawing
					var	padding = 2,        // separation between nodes within a cluster
				    	clusterPadding = 4, // separation between clusters
				    	maxRadius = 4,     
				    	rectLength = maxRadius*1.5;
					
					//Find the min and max values 
					var xMin = d3.min(keys, function(d){ return coords[d][0]; }),
						xMax = d3.max(keys, function(d){ return coords[d][0]; }),
						yMin = d3.min(keys, function(d){ return coords[d][1]; }),
						yMax = d3.max(keys, function(d){ return coords[d][1]; });		
					  
					var n = keys.length, // total number of nodes
				    	m = 16; // number of distinct clusters
				
					var force = d3.layout.force()
								   .nodes(nodes)
								   .size([width, height])
								   .gravity(.60)
								   .on("tick", tick)
								   .start();

					//Start the timeout so the animation doesn't last forever
					var timeout = window.setTimeout(start, 12000);
					
					var nodeGroup = svg.append("g")
					                   .attr("class", "node-group");
					
					var shapes = nodeGroup.selectAll("circle")
				    			  .data(nodes)
				    			  .enter();
					
					var circles = shapes.append("circle").filter(function(d){ return !d.isProduct }).attr("class", "node");
					var squares = shapes.append("rect")
										.filter(function(d){ return d.isProduct })
										.attr("class", "node")
										.attr("width", rectLength)
										.attr("height", rectLength);
						 
					var allNodes = d3.selectAll(".node")
					  	              .attr("data-category", function(d){
					  	            	  return d.category;
					  	              })
					  	              .attr("data-key", function(d){
					  	            	  return d.key;
					  	              })
					  	              .style("fill", function(d) { return colors[d.color]; })
					  	              .style("stroke", function(d) { return colors[d.color]; })
					  	              .on("click", function(d){
	  				  	            	  //Get the row from the table 
					  	            	  var row = $.grep(table, function(e){ return e.primaryKey == d.key; });					  	            	  
					  	            	  if(!row) return;
					  	            	  else row = row[0];
					  	            	  
				  	            		  var pretitle = $(document.createElement("span")).addClass("pretitle");
					  	            	  					  	            	  
					  	            	  //Get the info from the table for products and projects
					  	            	  if(d.isProduct){
					  	            		  var titlePretitle = $(pretitle).clone().text(row.DT),
					  	            		      title    = row.TI,
					  	            		      peoplePretitle = $(pretitle).clone().text("Authors"),
				  	            		      	  people   = row.AU,
				  	            		      	  journal  = $(document.createElement("span")).addClass("journal").text(row.SO_clean.toLowerCase()),
				  	            		      	  year     = $(document.createElement("span")).addClass("years").text(row.PY + ". "),
				  	            		      	  summary  = $(document.createElement("div")).append(year, journal),
				  	            		      	  type     = "product",
				  	            		      	  years    = "";					  	
					  	            		  
					  	            		  if(row.DI){
					  	            			var shortType = row.DT.split(";", 1)[0].toLowerCase(),
					  	            				icon      = $(document.createElement("i")).addClass("icon fa fa-external-link-square"),
					  	            				link      = $(document.createElement("a")).addClass("more-link")
						  	            													 .attr("href", "http://doi.org/" + row.DI)
						  	            													 .attr("target", "_blank")
						  	            													 .text("Go to this " + shortType)
						  	            													 .append(icon);
					  	            			$(summary).append($(document.createElement("div")).append(link));
					  	            		  }
					  	            		  
					  	            	  }
					  	            	  else{
				  	            		  	  var titlePretitle = $(pretitle).clone().text("Project"),
					  	            		  	  title    = row.Title_for_TM,
					  	            		  	  peoplePretitle = $(pretitle).clone().text("Project PIs"),
					  	            		      people   = row.Project_Pis,
					  	            		      summary  = $(document.createElement("p")).text(row.summary_for_TM),
					  	            		      type     = "project";
					  	            		  
				  	            		  	  if(row.last_actv_end_date_year == "NaN")
				  	            		  		  var years = row.first_actv_start_date_year;
				  	            		  	  else if(row.first_actv_start_date_year == row.last_actv_end_date_year)
					  	            			  var years = row.last_actv_end_date_year;
					  	            		  else
					  	            			  var years = row.first_actv_start_date_year + " to " + row.last_actv_end_date_year;
						  	             }
					  	            	  
					  	            	  //Get the formatted list of people
				  	            		  var names = people.split(";"),
				  	            		      formattedNames = "";
				  	            		  
				  	            		  //Filter out all the spaces
				  	            		  names = names.filter(function(n){ return(n != " "); });
				  	            		  
				  	            		  for(var i=0; i<names.length; i++){
				  	            			  if(names[i] == " ") continue;
				  	            			  
				  	            			  var name = names[i].split(",");
				  	            			  
				  	            			  if(name.length == 2)
				  	            				formattedNames += name[1] + " " + name[0];
				  	            			  else
				  	            			    formattedNames += name[0];
				  	            			  
				  	            			  if((names.length > 2) && (i < names.length-1))
				  	            				formattedNames += ", ";
				  	            			  else if((names.length == 2) && (i != names.length-1))
				  	            				formattedNames += " and ";
				  	            		  }
					  	            	 
					  	            	 //Insert the node info into the page
					  	            	 $("#node-info .node-title").text(title).prepend(titlePretitle);
					  	            	 $("#node-info .node-title").css("color", colors[d.category]);
					  	            	 $("#node-info .node-people").text(formattedNames).prepend(peoplePretitle);
					  	            	 $("#node-info .node-years").text(years).addClass(type);
					  	            	 $("#node-info .node-summary").html(summary).addClass(type);
					  	            	 
					  	            	 $("#sidetext").html(document.getElementById("node-info").innerHTML);	
					  	              });

					//************** Show a tooltip with node details when the node is moused over ************//
					//Insert an element to hold the title info on hover
					var tooltip = svg.append("g")
								     .attr("id", "node-tooltip");
					
           		    var tooltipRect = tooltip.append("rect")
							   			     .attr("width", configuration.tooltipWidth)
									         .attr("height", 100);
                   		  
					var tooltipText = tooltip.append("text")
											 .attr("dx", 0)
											 .attr("dy", 0)
											 .attr("x", 10)
											 .attr("y", 20)
											 .attr("text-anchor", "start");
					
					allNodes.on("mouseover", function(d){
						 if(!tooltipVisible) $("#node-tooltip").css("display", "block");
							
	  	            	 //Get the row from the table 
	  	            	  var row = $.grep(table, function(e){ return e.primaryKey == d.key; });					  	            	  
	  	            	  if(!row) return;
	  	            	  else row = row[0];
	  	            	  					  	            	  
	  	            	  //Get the info from the table for products and projects
	  	            	  if(d.isProduct){
	  	            		  var pretitle = row.DT || "",
	  	            		      title    = pretitle + ": " + row.TI;				  	            		  
	  	            	  }
	  	            	  else
	  	            		  var title    = "Project: " + row.Title_for_TM;
	  	            	  
	  	            	 //Insert the title into a hover element
		  	            tooltipText.text(title).call(wrap, configuration.tooltipWidth - 20);
		  	            var tooltipHeight = tooltipText.node().getBBox().height || 50; tooltipHeight += 20;
		  	            tooltipRect.attr("width", configuration.tooltipWidth)
		  	            		   .attr("height", tooltipHeight);
		  	            if(this.tagName == "rect"){
			  	            var x = parseInt(d3.select(this).attr("x")) + 20,
			  	                y = parseInt(d3.select(this).attr("y")) + 20;
		  	            }
		  	            else if(this.tagName =="circle"){
				  	          var x = parseInt(d3.select(this).attr("cx")) + 24,
			  	                  y = parseInt(d3.select(this).attr("cy")) + 24;
		  	            }
		  	            
		  	            //Check that the tooltip will not be overflowing the edge of the SVG
		  	            var rightEdge = width,
		  	            	tooltipRightEdge = x + configuration.tooltipWidth,
		  	            	bottomEdge = height,
		  	            	tooltipBottomEdge = y + tooltipHeight;
		  	            
		  	            //Adjust the x and y coordinates of the tooltip if it will be overflowing the right or bottom edge (left and top edges are not at risk)
		  	            if(tooltipRightEdge > rightEdge)
		  	            	x = x - (tooltipRightEdge - rightEdge - 5);
		  	            if(tooltipBottomEdge > bottomEdge)
		  	            	y = y - (tooltipBottomEdge - bottomEdge - 5);
		  	            
			  	        $("#node-tooltip tspan").attr("x", x);
			  	        $("#node-tooltip tspan").attr("y", y);
		  	            tooltipRect.attr("x", x);
		  	            tooltipRect.attr("y", y);
	  	              });
					
					allNodes.on("mouseout", function(d){
						$("#node-tooltip").css("display", "none");
					});
						
					//** Stop the animation and clear the animation timeout **//
					function start(){
						force.stop();
						window.clearTimeout(timeout);
					}
							
					allNodes.transition()
					    .duration(5)
					    .delay(function(d, i) { return i * 2; })
					    .attrTween("r", function(d) {
					         var i = d3.interpolate(0, d.radius);
					         return function(t) { return d.radius = i(t); };
					    });
				
					//** Generic functions used for node animation **//
					function tick(e) {
						allNodes.each(cluster(10 * e.alpha * e.alpha))
					      .each(collide(.5));
						
					    circles.attr("cx", function(d) { return d.x; })
					      	   .attr("cy", function(d) { return d.y; });
					    squares.attr("x", function(d) { return d.x - (rectLength/2); })
				      	       .attr("y", function(d) { return d.y - (rectLength/2); });
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

			/************************************************************************************
			 * Select Nodes - Changes the node opacity and color to correspond to its weight for the given topic/category
			 *************************************************************************************/	
			function selectNodes(category){
				d3.selectAll(".node")
				  .transition()
				  .duration(800)
				  .style("opacity", function(d){
					  var key = $(this).attr("data-key");
					  var row = $.grep(table, function(e){ return e.primaryKey == key; });
					  var categoryName = "lda020selected_topicWeights_" + category;
					  return row[0][categoryName];
				  })
				  .style("fill", function(d){
					  return colors[$(this).attr("data-category")];
				  })
				  .style("stroke", function(d){
					  return colors[$(this).attr("data-category")];
				  });
			}
			
			/************************************************************************************
			 * Select Category - Selects the specified category and "filter" the nodes related to that category
			 *************************************************************************************/
			function selectCategory(element, category){
				  //If this arc is already selected...
	        	  if(d3.select(element).classed("selected")){
	        		 reset();
	        	  }
	        	  // If this is a new selection...
	        	  else{
	        		  resetFilters();

	        		  //Select all the other arcs and color them as inactive
	        		  $("path.arc").css("fill", (configuration.inactiveArcColor || "#F0F0F0"));
	        		  $(".arc-label").addClass("inactive");
	        		  
	        		  //Select any other arc that is marked as "selected" and remove that class
	        		  $("path.arc.selected").each(function(i, arc){
	        			  var newClasses = $(arc).attr("class").replace("selected", "");
		    	          $(arc).attr("class", newClasses);
	        		  });
	        		  
	        		  //Then select the active arc and recolor it as its original color
	        		  var currentClasses = $(element).attr("class");
	        		  $(element)
	    	            .css("fill", colors[category])
	    	            .attr("class", currentClasses + " selected");
	        		  
	    	          //Call our function that will manipulate the nodes for this category
	        		  selectNodes(category);
	        		  
	        		  //Show the category in the side text
		        	  var projectText = document.getElementById("cat-info-" + category); 
		        	  $(projectText).find("h1").css("color", colors[category]);
		        	  $("#sidetext").html(projectText.innerHTML);
	        	  }
			}
			
			/************************************************************************************
			 * Reset - Shortcut function for restting the whole app
			 *************************************************************************************/	
			function reset(){
				resetNodes();
				resetCategories();
      		  	resetFilters();
			}
			
			/************************************************************************************
			 * Reset Nodes - Resets the color/opacity of the nodes
			 *************************************************************************************/
			function resetNodes(){
				d3.selectAll(".node")
				  .transition()
				  .duration(800)
				  .style("opacity", 1)
				  .style("fill", function(d){
					  return colors[$(this).attr("data-category")];
				  })
				  .style("stroke", function(d){
					  return colors[$(this).attr("data-category")];
				  });
			}
			
			/************************************************************************************
			 * Reset Categories - resets the category colors and reverts back to introduction text
			 *************************************************************************************/	
			function resetCategories(){
				//Change all the other arc colors back to normal
	  		  	$("path.arc").css("fill", function(){
	  			  return colors[$(this).attr("data-category")];
	  		  	});
	  		  
	  		  	//Mark all category arcs as inactive
	  		  	$(".arc-label").removeClass("inactive");
	  		  
	  		  	//Make the new list of classes and add them
	  		  	var prevSelected = $(".arc-label.selected");
	  		  	var newClasses = prevSelected.attr("class").replace("selected", "");
	  		  	prevSelected.attr("class", newClasses);
	  		  
	  		  	//change the text back to the original
	  		  	$("#sidetext").html(intro);
			}
			
			function resetFilters(){
				document.location.hash = "";
			}
			
			/************************************************************************************
			 * Setup Filters - Listen to filter inputs
			 *************************************************************************************/	
			function setupFilters(){
				var filterElements = $("form .filters .filter"),
					submitButton   = $("form .filters .button");
				
				//When a user types anything in the filter input, check if it is the 'Enter' key and if so, submit the value as a filter query
				$(filterElements).on("keypress", function(e){
					//Only proceed if the user pressed Enter
					if(e.keyCode != 13) return;
					
					//Prevent the form from submitting to the target/page refreshing
					e.preventDefault();
					
					//Get the filter information
					var inputElement = $(e.target);
					
					var options = {
						attribute: inputElement.attr("data-table-col"),
						filterName: inputElement.attr("name"),
						value: inputElement.val()
					}
					filterNodes(options);	
				});
				
				
			}
			
			/************************************************************************************
			 * Filter Nodes - Highlight only the nodes with the given attributes
			 *************************************************************************************/				
			function filterNodes(options){				
				var attributes  = options.attribute.split(" "),
					filterValue = options.value;

					d3.selectAll(".node")
					  .transition()
					  .duration(800)
					  .each(function(d){
						  var key = $(this).attr("data-key"),
						  	  row = $.grep(table, function(e){ return e.primaryKey == key; }),
						  	  attributeValues = "";					  
						  
						  for(var i=0; i < attributes.length; i++){
								var attribute = attributes[i],
									rawValue = row[0][attribute];
								
								attributeValues += " " + rawValue + " " + rawValue.toLowerCase();
								
								//Check for formatted names like "Smith, John". They will be seperated by semi-colons (;)
								if(rawValue.indexOf(";") > -1){
									var names = rawValue.split(";"); //Get an array of names
			  	            		names = names.filter(function(n){ return(n != " "); }); //Filter out spaces
									
			  	            		//For each name, separate the first and last names and combine them together in order, as they are likely to be searched on
			  	            		for(var x=0; x<names.length; x++){
										var fullName = names[x].split(","),
											formattedName = fullName[1] + " " + fullName[0];
										attributeValues += " " + formattedName + " " + formattedName.toLowerCase();
									}
								}
						  }
						  
						  //If there is a value for this attribute(s)
						  if(attributeValues.length > 0){
							  //If our filter/search query string is a substring of the attribute value(s)
							  if((attributeValues.indexOf(filterValue) > -1) || (attributeValues.indexOf(filterValue.toLowerCase()) > -1)){
								  //Make these nodes brightest and use their category color
								  $(this).css("opacity", 1)
									   .css("fill",   colors[$(this).attr("data-category")])
									   .css("stroke", colors[$(this).attr("data-category")]);
							  }
							  //Otherwise fade out this nodes and make them grayish
							  else 
								  $(this).css("opacity", 0.05).css("fill", "#000000").css("stroke", "#000000");
						  }
						  //Otherwise fade out this nodes and make them grayish						  
						  else 
							  $(this).css("opacity", 0.05).css("fill", "#000000").css("stroke", "#000000");
					  });
					
					//Clear the text inputs
					$("input.filter").val("");
					
					//Update the URL with the query string
					var filters     = document.location.hash.split("?"),
						newLocation = "";
					
					//Iterate over each filter query string from the URL
					for(var i=0; i<filters.length; i++){
						//Get the filter category name
						var filterCategory = filters[i].substring(0, filters[i].indexOf("="));	
						
						//If this filter category is not the current filter we just applied, then add it to the URL
						if((filterCategory != options.filterName) && (filterCategory.length > 0) && (filters[i].length > 0))
							newLocation += "?" + filterCategory + "=" + filters[i];					
					}
					
					//Add the new filter to the URL
					newLocation += "?" + options.filterName + "=" + filterValue;
					
					//Update the URL
					document.location.hash = newLocation;
			}
			
			function wrap(text, width) {
				  text.each(function() {
				    var text = d3.select(this),
				        words = text.text().split(/\s+/).reverse(),
				        word,
				        line = [],
				        lineNumber = 0,
				        lineHeight = 1.1, // ems
				        x = text.attr("x"),
				        y = text.attr("y"),
				        dy = parseFloat(text.attr("dy")),
				        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dx", 10).attr("dy",++lineNumber * lineHeight + dy + "em");
				    while (word = words.pop()) {
				      line.push(word);
				      tspan.text(line.join(" "));
				      if (tspan.node().getComputedTextLength() > width) {
				        line.pop();
				        tspan.text(line.join(" "));
				        line = [word];
				        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dx", 10).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				      }
				    }
				  });
				}
			
			/************************************************************************************
			 * Simple Expand/Collapse for long text
			 *************************************************************************************/	
			$(".expander").on("click", function(e){
				var targetID = $(e.target).attr("data-target") || $(e.target).parents("[data-target]").attr("data-target");
				
				var targetElement = $("#" + targetID);
				targetElement.slideToggle();
			});
	
			});
		});
	});
});