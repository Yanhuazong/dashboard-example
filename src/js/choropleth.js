import { select } from 'd3-selection';
import { scaleSequential, scaleLinear } from 'd3-scale';
import { geoMercator, geoPath } from 'd3-geo';
import { max, range } from 'd3-array';
import { axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { interpolateReds } from 'd3-scale-chromatic';

export const drawMap = (geoData, data, id, width, height) => {

  select(`#${id} svg`).remove();
  
  // Create the group container with margin adjustment
  const svg = select(`#${id}`)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Convert collision data into a lookup table by zip code
  const collisionByZipCode = {};
  data.forEach((d) => {
    collisionByZipCode[d.zipcode] = +d.count;
  });

  // Create a color scale based on the number of collisions
  const colorScale = scaleSequential(interpolateReds)
    .domain([0, max(data, (d) => +d.count)]);

  const projection = geoMercator()
    .center([-73.94, 40.7])
    .scale(30000)
    .translate([width / 2, (height + 60) / 2]);

  const path = geoPath().projection(projection);

  // Draw the zip codes
  svg.selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const zipCode = d.properties.modzcta;
      const collisions = collisionByZipCode[zipCode];
      return collisions ? colorScale(collisions) : "#ccc";
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 1);

  // Add a legend
  const stepCount = 6;
  const legendHeight = 100;
  const rectHeight = legendHeight / stepCount;

  const legend = svg.append("g").attr("transform", `translate(${width - 50}, 50)`);
  const maxCount = max(data, (d) => +d.count);
  
  const legendScale = scaleLinear()
    .domain([0, maxCount])  // Domain based on data values
    .range([0, legendHeight]);

  const tickValues = range(0, maxCount, maxCount / stepCount).concat(maxCount);  // Add the max value

  const legendAxis = axisRight(legendScale)
    .tickValues(tickValues)
    .tickSize(6)
    .tickFormat(format(".0f"));

  legend.append("g")
    .attr("transform", "translate(20, 0)")
    .call(legendAxis);

  legend.selectAll("rect")
    .data(range(0, 1, 1 / stepCount))
    .join("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * rectHeight)
    .attr("width", 20)
    .attr("height", rectHeight)
    .attr("fill", (d) => colorScale(max(data, (d) => +d.count) * d));

  // Tooltip functionality on hover
  svg.selectAll("path")
    .on("mouseover", function (event, d) {
      const zipcode = d.properties.modzcta;
      const collisions = collisionByZipCode[zipcode] || 0;
      select(this).attr("stroke", "black").attr("stroke-width", 2);

      select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #000")
        .style("padding", "5px")
        .style("font-size", "12px")
        .html(`<strong>${zipcode}</strong><br/>Collisions: ${collisions}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    })
    .on("mouseout", function () {
      select(this).attr("stroke", "#333").attr("stroke-width", 1);
      select(".tooltip").remove();
    });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Choropleth map of collisions in NYC");
};
