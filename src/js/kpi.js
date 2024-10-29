import { select } from 'd3-selection';

export const drawKPI = (data, id, width, height) => {
    select(`#${id} svg`).remove();
    const svg = select(`#${id}`)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    svg
      .selectAll("text")
      .data([data])
      .join("text")
      .attr("x", width / 2)
      .attr("y", height / 2 - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text((d) => `${d.collisions_year} TOTAL COLLISIONS:`)
      .attr("class", "intro-text")
      .append("tspan")
      .text((d) => d.count)
      .attr("x", width / 2)
      .attr("dy", "1.2em")
      .style("font-size", "40px")
      .style("font-weight", "bold")
      .attr("class", "collision-text");
  };
  