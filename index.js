// The svg
var body = d3.select("body");
const tooltip = document.getElementById("tooltip");

var svg = d3.select("#map"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();

// Load external data and boot

d3.queue()
    .defer(d3.json, "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
    .defer(d3.json, "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
    .await(ready);

function ready(error, topoMap, extraData) {

    if (error) throw error;

    minBachOrHigher = d3.min(extraData, (d) => d.bachelorsOrHigher);
    maxBachOrHigher = d3.max(extraData, (d) => d.bachelorsOrHigher);

    var colorScale = d3.scaleSequential(d3.interpolateRdPu)
        .domain([minBachOrHigher, maxBachOrHigher]);

    svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(topoMap, topoMap.objects.states).features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("fill", "white")
        .attr("opacity", ".5")
        .attr("stroke", "#333")
        .attr("stroke-width", "2")
        .attr("d", path);
    
    svg.append("g")
        .attr("class", "counties")        
        .selectAll("path")
        .data(topojson.feature(topoMap, topoMap.objects.counties).features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("opacity", "1")
        .attr("data-fips", function(d) {
            return d.id
            })
        .attr("data-education", function(d) {
            var result = extraData.filter(function( obj ) {
              return obj.fips == d.id;
            });
            if(result[0]){
              return result[0].bachelorsOrHigher
            }
            //could not find a matching fips id in the data
            console.log('could find data for: ', d.id);
            return 0
           })
        .attr("fill", function(d) {
            var result = extraData.filter(function( obj ) {
              return obj.fips == d.id;
            });
            if(result[0]){

                return colorScale(result[0].bachelorsOrHigher);
            }
            //could not find a matching fips id in the data
            console.log('could find color data for: ', d.id);
            return colorScale(minBachOrHigher);
           })
        .attr("d", path)
        .on("mouseover", (d) => {
            var result = extraData.filter(function( obj ) {
                return obj.fips == d.id;
              });
            let area_name = result[0].area_name,
                state = result[0].state,
                bachelorsOrHigher = result[0].bachelorsOrHigher;
            tooltip.setAttribute("data-education", bachelorsOrHigher);
            tooltip.classList.remove("noShow");
            tooltip.classList.add("show");
            tooltip.style.left = (d3.event.pageX) + "px";
            tooltip.style.top = (d3.event.pageY - 100) + "px";
            tooltip.innerHTML = `
                <p>${area_name}, ${state}: ${bachelorsOrHigher}</p>
                `;
        }).on("mouseout", () => {
            tooltip.classList.remove("show");
            tooltip.classList.add("noShow");
        });
        
        let educationRange = [];
        
        let counter = minBachOrHigher;
        while(counter <= maxBachOrHigher){
            educationRange.push(counter)
            counter += 7;
        }

    var legend = svg.append("g")
        .attr("width", "10")
        .attr("height", "10")
        .attr("id", "legend")
        .attr("fill","white")
        .attr("transform", "translate(550, 10)");

    legend.selectAll("rect")
        .data(educationRange)
        .enter()
        .append("rect")
            .attr("class", "lengend-item")
            .attr('x', function (d, i) { return 30 * i })
            .attr("y", "12")
            .attr('width', "30")
            .attr('height', "15")
            .attr("stroke", "white")
            .style("fill", function(d) { return colorScale(d)} );
        

    legend.selectAll("text")
        .data(educationRange)
        .enter()
        .append("text")
            .attr('x', function (d, i) { return 30 * i - 7 })
            .attr("y", "40")
            .attr("font-size", "9px")
            .attr("font-weight", "bold")
            .text(function(d) { return d  + "%"});
                        
}

