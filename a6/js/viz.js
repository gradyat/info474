const m = {
    width: 800,
    height: 600
}

const svg = d3.select("body").append('svg')
    .attr('width', m.width)
    .attr('height', m.height)

const g = svg.append('g')

d3.json('/data/nygeo.json').then(function (data) {

    d3.json('/data/airbnb.json').then(function (pointData) {

        const albersProj = d3.geoAlbers()
            .scale(74000)
            .rotate([73.991984, 0])
            .center([0, 40.727019])
            .translate([m.width / 2, m.height / 2]);

        const geoPath = d3.geoPath()
            .projection(albersProj)

        g.selectAll('path')
            .data(data.features)
            .enter()
            .append('path')
            .attr('fill', '#ccc')
            .attr('d', geoPath)

        g.selectAll('.circle')
            .data(pointData)
            .enter()
            .append('circle')
            .attr('cx', function (d) {
                let scaledPoints = albersProj([d['longitude'], d['latitude']])
                return scaledPoints[0]
            })
            .attr('cy', function (d) {
                let scaledPoints = albersProj([d['longitude'], d['latitude']])
                return scaledPoints[1]
            })
            .attr('r', 1.5)
            .attr('stroke', '#999')
            .attr('stroke-width', '0.25')
            .attr('fill', 'steelblue') 
            .on("click", function () {
                d3.select(this)
                    .attr("opacity", 1)
                    .transition()
                    .duration(2000)
                    .attr("cx", Math.round(Math.random()))
                    .attr("cy", Math.round(Math.random()))
                    .attr('r', 25)
                    .attr('fill', 'red')
                    .attr("opacity", 0)
                    .on("end", function () {
                        d3.select(this).remove();
                    })
            });
    })

})
