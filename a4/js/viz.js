'use strict';


(function () {

    const dot_color = d3.scaleOrdinal()
        .domain(["Bug", "Dark", "Electric", "Fairy", "Fighting", "Fire", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Steel", "Water"])
        .range(["#4E79A7", "#A0CBE8", "#F28E2B", "#FFBE7D", "#59A14F", "#8CD17D", "#B6992D", "#499894", "#86BCB6", "#FABFD2", "#E15759", "#FF9D9A", "#79706E", "#BAB0AC", "#D37295"])

    const generations = [1, 2, 3, 4, 5, 6]

    const legendary = ['All', 'True', 'False']

    let data = "no data";
    let svgContainer = ""; // keep SVG reference in global scope

    // load data and make scatter plot after window loads
    window.onload = function () {
        svgContainer = d3.select('body')
            .append('svg')
            .attr('width', 700)
            .attr('height', 500);
        // d3.csv is basically fetch but it can be be passed a csv file as a parameter
        d3.csv("/data/pokemon.csv")
            .then((data) => makeScatterPlot(data));
    }

    // make scatter plot with trend line
    function makeScatterPlot(csvData) {
        data = csvData // assign data as global variable

        // get arrays of data
        let sp_def_data = data.map((row) => parseFloat(row["SpDef"]));
        let total_data = data.map((row) => parseFloat(row["Total"]));

        // find data limits
        let axesLimits = findMinMax(sp_def_data, total_data);

        // draw axes and return scaling + mapping functions
        let mapFunctions = drawAxes(axesLimits, "SpDef", "Total");

        makeDropdowns();

        // plot data as points and add tooltip functionality
        plotData(mapFunctions);


        // draw title and axes labels
        makeLabels();

        makeLegend();
    }

    // make title and axes labels
    function makeLabels() {
        svgContainer.append('text')
            .attr('x', 100)
            .attr('y', 40)
            .style('font-size', '14pt')
            .text("Pokemon Scatterplot");

        svgContainer.append('text')
            .attr('x', 130)
            .attr('y', 490)
            .style('font-size', '10pt')
            .text('Sp. Def');

        svgContainer.append('text')
            .attr('transform', 'translate(15, 300)rotate(-90)')
            .style('font-size', '10pt')
            .text('Total');
    }

    function makeDropdowns() {
        let filter1 = d3.select('body')
            .append('select')
            .attr('id', 'legendaryFilter')
            .selectAll('option')
            .data(legendary)
            .enter()
            .append('option')
            .attr('value', function (d) {
                return d
            })
            .html(function (d) {
                return d
            })
        filter1 = d3.select('#legendaryFilter')

        let filter2 = d3.select('body')
            .append('select')
            .attr('id', 'generationFilter')
            .selectAll('option')
            .data(generations)
            .enter()
            .append('option')
            .attr('value', function (d) {
                return d
            })
            .html(function (d) {
                return d
            })
        filter2 = d3.select('#generationFilter')

        // filter1.on('change', (d) => {
        //     let selected_legendary = this.value
        //     console.log(selected_legendary)
        // });
    }

    // plot all the data points on the SVG
    // and add tooltip functionality
    function plotData(map) {



        // mapping functions
        let xMap = map.x;
        let yMap = map.y;

        // make tooltip
        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // append data to SVG and plot as points
        svgContainer.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', xMap)
            .attr('cy', yMap)
            .attr('r', 3)
            .attr('fill', function (d) { return dot_color(d.Type1) }) // NEED TO CHANGE COLORS
            // add tooltip functionality to points
            .on("mouseover", (d) => {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.Name + "<br/>" + d.Type1 + "<br/>" + d.Type2)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", (d) => {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    // draw the axes and ticks
    function drawAxes(limits, x, y) {
        // return x value from a row of data
        let xValue = function (d) { return +d[x]; }

        // function to scale x value
        let xScale = d3.scaleLinear()
            .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
            .range([50, 450]);

        // xMap returns a scaled x value from a row of data
        let xMap = function (d) { return xScale(xValue(d)); };

        // plot x-axis at bottom of SVG
        let xAxis = d3.axisBottom().scale(xScale);
        svgContainer.append("g")
            .attr('transform', 'translate(0, 450)')
            .call(xAxis);

        // return y value from a row of data
        let yValue = function (d) { return +d[y] }

        // function to scale y
        let yScale = d3.scaleLinear()
            .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
            .range([50, 450]);

        // yMap returns a scaled y value from a row of data
        let yMap = function (d) { return yScale(yValue(d)); };

        // plot y-axis at the left of SVG
        let yAxis = d3.axisLeft().scale(yScale);
        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis);

        // return mapping and scaling functions
        return {
            x: xMap,
            y: yMap,
            xScale: xScale,
            yScale: yScale
        };
    }

    // find min and max for arrays of x and y
    function findMinMax(x, y) {

        // get min/max x values
        let xMin = d3.min(x);
        let xMax = d3.max(x);

        // get min/max y values
        let yMin = d3.min(y);
        let yMax = d3.max(y);

        // return formatted min/max data as an object
        return {
            xMin: xMin,
            xMax: xMax,
            yMin: yMin,
            yMax: yMax
        }
    }

    function makeLegend() {
        svgContainer.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(500,50)");

        var legendOrdinal = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolCircle).size(75)())
            .shapePadding(5)
            .cellFilter(function (d) { return d.label !== "e" })
            .scale(dot_color);

        svgContainer.select(".legendOrdinal")
            .call(legendOrdinal);
    }



})();
