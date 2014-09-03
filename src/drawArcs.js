 
jQuery(document).ready(function($) {
	
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
	
	  var g = svg.selectAll(".arc")
	      .data(pie(data))
	    .enter().append("g")
	      .attr("class", "arc");
	
	  g.append("path")
	      .attr("d", arc)
	      .style("fill", function(d) { 
	    	  console.log(colors[d.data["topic after removal"]]);
	    	  return colors[d.data["topic after removal"]]; 
	    	});
	
	  g.append("text")
	      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	      .attr("dy", ".35em")
	      .style("text-anchor", "middle")
	      .text(function(d) { return d.data.category; });
	
	});
	
	
});