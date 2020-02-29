const margin = { top: 50, right: 50, bottom: 50, left: 50 }
    , width = 800 - margin.left - margin.right // Use the window's width 
    , height = 600 - margin.top - margin.bottom // Use the window's height

// load data
d3.csv('data/gapminder.csv').then((data) => {

    // append the div which will be the tooltip
    // append tooltipSvg to this div
    const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    // make an svg and append it to body
    const svg = d3.select('body').append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    const tooltipSvg = div.append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    // get only data for the year 1980
    scatterplotData = data.filter(d => d['year'] == 1980)

    // get year min and max for us
    const fertilityLimits = d3.extent(scatterplotData, d => d['fertility'])
    // get scaling function for fertility (x axis)
    const xScale = d3.scaleLinear()
        .domain([fertilityLimits[0], fertilityLimits[1]])
        .range([margin.left, width + margin.left])

    // make x axis
    const xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale))

    const xAxis2 = tooltipSvg.append("g")
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale))

    // get min and max life expectancy for US
    const lifeExpectancyLimits = d3.extent(scatterplotData, d => d['life_expectancy'])

    // get scaling function for y axis
    const yScale = d3.scaleLinear()
        .domain([lifeExpectancyLimits[1], lifeExpectancyLimits[0]])
        .range([margin.top, margin.top + height])

    // make y axis
    const yAxis = svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale))

    const yAxis2 = tooltipSvg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale))

    // d3's line generator
    const line = d3.line()
        .x(d => xScale(d['year'])) // set the x values for the line generator
        .y(d => yScale(d['population'])) // set the y values for the line generator

    // const title = svgContainer.append('text')
    //     .attr('x', 100)
    //     .attr('y', 40)
    //     .style('font-size', '14pt')
    //     .text("Fertility vs. Life Expectancy (1980)")

    // append line to svg
    tooltipSvg.append("path")
        // difference between data and datum:
        // https://stackoverflow.com/questions/13728402/what-is-the-difference-d3-datum-vs-data
        .datum(scatterplotData)
        .attr("d", function (d) { return line(d) })
        .attr("fill", "steelblue")
        .attr("stroke", "steelblue")

    // append dots to svg to track data points
    svg.selectAll('.dot').data(scatterplotData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d['fertility']))
        .attr('cy', d => yScale(d['life_expectancy']))
        .attr('r', 4)
        .attr('fill', 'steelblue')
        // get rid of .html
        .on("mouseover", function (d) {
            tooltipSvg.html();
            div.transition()
                .duration(200)
                .style('opacity', 0.9)

            div.style('left', d3.event.pageX + "px")
                .style('top', (d3.event.pageY - 28) + "px")

            let tooltipCountry = d['country']

            let tooltipData = data.filter(d => d['country'] == tooltipCountry)

            
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(300)
                .style('opacity', 0)
        })

    let labeledScatterplotData = scatterplotData.filter(function (d) { return +d['population'] > 100000000 })

    svg.selectAll('.text')
        .data(labeledScatterplotData)
        .enter()
        .append('text')
        .attr('x', function (d) { return xScale(+d['fertility']) })
        .attr('y', function (d) { return yScale(+d['life_expectancy']) - 20 })
        .text(function (d) { return d['country'] })
})
