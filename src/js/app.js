import { json } from 'd3-fetch';
import { select } from 'd3-selection';
import { drawKPI } from './kpi';
import { drawMap } from './choropleth';
import "../scss/style.scss";

const fetchData = async (width, height) => {
    try {
        const data = await fetch('/api/~zong6/fetch-data.php')
        .then(response => response.json())
        .catch(error => console.error('Error fetching data:', error));
      const geoData = await json("/api/~zong6/MODZCTA_20240916.geojson");

      if(data){
        select('.load-text').attr('class', "hide")
        select('.filter-wrap').attr('class', "filter-wrap")
        select('.charts-wrap').attr('class', "charts-wrap")

      }
      const years = data.yearTotalData.map(d => d.collisions_year).sort((a, b) => b - a);
      
      let totalCollisions = data.yearTotalData.find((d) => d.collisions_year === years[0]);
      let zipcodeData = data.zipcodeData.filter((d) => d.collisions_year === years[0]);
      const yearSelect = select('#yearSelect')
      yearSelect.selectAll('option')
                .data(years)
                .join('option')
                .attr('value', d => d)
                .text(d => d);
      yearSelect.on('change', function() {
        const year = this.value
        let totalCollisions = data.yearTotalData.find((d) => d.collisions_year === year);
        let zipcodeData = data.zipcodeData.filter((d) => d.collisions_year === year);
        drawKPI(totalCollisions, "large-text", width, height);
        drawMap(geoData, zipcodeData, "map", width, height);
      })

      drawKPI(totalCollisions, "large-text", width, height);
      drawMap(geoData, zipcodeData, "map", width, height);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const width = parseInt(select(".chart").style("width"));
  const height = width;
  fetchData(width, height);
