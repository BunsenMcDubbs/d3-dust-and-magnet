function render(id, fData) {
    /**************************************************************************/
    /* BEGIN: initial variables                                               */
    /**************************************************************************/
    /**
     * General info about the window and the visualization
     */
    var panelHeight = 50
    var width = $(window).width() - 50
    var height = $(window).height()
    var padding = 10
    var dustRadius = 5
    var magnetRadius = 20

    // get properties of the data
    var props = new Array()
    var p = fData[0]
    for (var key in p) {
        props.push(key)
    }

    var keys = [
        // {name: 'RetailPrice'},
        // {name: 'EngineSize'},
        {name: 'Cyl'},
        // {name: 'HP'},
        //{name: 'CityMPG'},
        {name: 'HwyMPG'}
        ]

    // keep track of the magnets that are active (clicked)
    var activeMagnets = []
    keys.forEach(function(d) {
        //activeMagnets.push({name: d.name, active: false})
        // calculate the min and max for each
        d.min = d3.min(fData, function(val) { return val[d.name]; })
        d.max = d3.max(fData, function(val) { return val[d.name]; })
        d.active = false
    })

    /**
     * Funtion to handle tooltips over the dust
     */
    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    console.log(d);
                    return "<strong>"+ d.name +"</strong>";
                })

    var drag = d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("drag", dragmove)
                .on("dragend", updateDust)

    function dragmove(d) {
        console.log('here');
        console.log(d);
        console.log(d3.event.x);
        d3.select(this)
            .attr("cx", d.x = Math.max(magnetRadius, Math.min(width - magnetRadius, d3.event.x)))
            .attr("cy", d.y = Math.max(magnetRadius, Math.min(height - magnetRadius, d3.event.y)));
    }

    function updateDust() {
        d3.selectAll('.dust-circle')
            .transition()
            .duration(1000)
            .ease('bounce')
            .attr('cx', function(d) {
                // current loc
                var x = d.x
                keys.forEach(function(key) {
                    var val = key.name
                    var dustVal = d[val]
                    // get the difference in distance
                    var deltaX = key.x - x
                    // get the force scalar
                    var scale = d3.scale.linear().domain([key.min, key.max]).range([0.1, 0.9])
                    var force = scale(dustVal)
                    x += deltaX * force
                })
                return x
            })
            .attr('cy', function(d) {
                // current loc
                var y = d.y
                keys.forEach(function(key) {
                    var val = key.name
                    var dustVal = d[val]
                    // get the difference in distance
                    var deltaY = key.y - y
                    // get the force scalar
                    var scale = d3.scale.linear().domain([key.min, key.max]).range([0.1, 0.9])
                    var force = scale(dustVal)
                    y += deltaY * force
                })
                return y
            })
    }

    /**************************************************************************/
    /* END: initial variables                                                 */
    /**************************************************************************/


    // create the svg
    var svg = d3.select(id).append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('style', 'padding: 10px 10px;');
    // create the magnet circles
    var magnets = svg.selectAll('.magnet-group')
                        .data(keys)
                        .enter()
                        .append('g')
                        .attr('class', 'magnet-group')
    magnets.call(tip)
    // create the magnet circles
    magnets.append('circle')
            .attr('class', 'magnet-circle')
            .attr('cx', function(d, i) {
                d.x = i * 2 * magnetRadius + i * padding + padding + 40
                return d.x
            })
            .attr('cy', function(d, i) {
                d.y = height - (magnetRadius + padding)
                return d.y
            })
            .attr('r', function(d, i) {
                return magnetRadius
            })
            .call(drag)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
    var dust = svg.selectAll('.dust-group')
                        .data(fData)
                        .enter()
                        .append('g')
                        .attr('class', 'dust-group');
    dust.call(tip)
    // add in the dust
    dust.append('circle')
        .attr('class', 'dust-circle')
        .attr('cx', function (d) {
            var rand = Math.random() * (width);
            d.x = rand;
            return d.x;
        })
        .attr('cy', function (d) {
            var rand = Math.random() * (height - panelHeight);
            d.y = rand;
            return d.y;
        })
        .attr('r', 5)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
}
