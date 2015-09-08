function render(id, fData) {
    /**************************************************************************/
    /* BEGIN: initial variables                                               */
    /**************************************************************************/
    /**
     * General info about the window and the visualization
     */
    var panelHeight = 50;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var padding = 10;
    var dustRadius = 5;
    var magnetRadius = 20;

    // get properties of the data
    var props = [];
    var p = fData[0];
    for (var key in p) {
        props.push(key);
    }

    var keys = [
        {name: 'RetailPrice'},
        {name: 'EngineSize'},
        {name: 'Cyl'},
        {name: 'HP'},
        {name: 'CityMPG'},
        {name: 'HwyMPG'}
    ];

    // keep track of the magnets that are active (clicked)
    var activeMagnets = [];
    keys.forEach(function(d) {
        //activeMagnets.push({name: d.name, active: false})
        // calculate the min and max for each
        d.min = d3.min(fData, function(val) { return val[d.name]; });
        d.max = d3.max(fData, function(val) { return val[d.name]; });
        d.active = false;
        d.fill = 'black';
    });

    /**
     * Funtion to handle tooltips over the dust
     */
    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>"+ d.name +"</strong>";
                });

    var drag = d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("drag", dragmove);

    function dragmove(d) {
        // console.log("drag");
        d.noClick = true;
        d3.select(this)
            .attr("cx", d.x = Math.max(d.rad, Math.min(width - d.rad, d3.event.x)))
            .attr("cy", d.y = Math.max(d.rad, Math.min(height - d.rad, d3.event.y)));
    }

    d3.timer(updateDust);

    function updateDust() {
        d3.selectAll('.dust-circle')
            // .transition()
            // .duration(500)
            // // .delay(function(d, i) {
            // //     return i * 10
            // // })
            // .ease('bounce')
            .attr('cx', function(d) {
                // current loc
                var dx = 0;
                keys.forEach(function(key) {
                    if (key.active === true) {
                        dx += (d.normalized)[key.name] * key.rad * (key.x - d.x) / 50;
                    }
                });
                d.x += dx;
                return d.x;
            })
            .attr('cy', function(d) {
                // current loc
                var dy = 0;
                keys.forEach(function(key) {
                    if (key.active === true) {
                        dy += (d.normalized)[key.name] * key.rad * (key.y - d.y) / 50;
                    }
                });
                d.y += dy;
                return d.y;
            });
    }

    function updateMagnets() {
        d3.selectAll('.magnet-circle')
            .attr('fill', function(d) {
                return d.fill;
            })
            .attr('r', function(d) {
                return d.rad;
            });
    }

    /**************************************************************************/
    /* END: initial variables                                                 */
    /**************************************************************************/


    // create the svg
    var svg = d3.select(id).append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('style', 'padding: 0;');
    // create the magnet circles
    var magnets = svg.selectAll('.magnet-group')
                        .data(keys)
                        .enter()
                        .append('g')
                        .attr('class', 'magnet-group')
                        .call(tip)
                        .each(function(d) {
                            var self = this;
                            var hammertime = new Hammer(self, {
                                prevent_default: true,
                            });
                            hammertime.get('pinch').set({ enable: true });
                            hammertime.on('pinch', function(ev) {
                                var test = d3.select(self).datum();
                                console.log(test);
                                var x = ev.pointers[0].pageX - ev.pointers[1].pageX;
                                x = x * x;
                                var y = ev.pointers[0].pageY - ev.pointers[1].pageY;
                                y = y * y;
                                test.rad = Math.sqrt(x + y) / 2;
                                updateMagnets();
                            });
                        });

    //magnets.call(tip)
    // create the magnet circles
    magnets.append('circle')
            .attr('class', 'magnet-circle')
            .attr('cx', function(d, i) {
                d.x = i * 2 * magnetRadius + i * padding + padding + 40;
                return d.x;
            })
            .attr('cy', function(d, i) {
                d.y = height - (magnetRadius + padding);
                return d.y;
            })
            .attr('r', function(d, i) {
                d.rad = magnetRadius;
                return d.rad;
            })
            .attr('fill', function(d) {
                return d.fill;
            })
            .call(drag)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('click', function(d) {
                // console.log("click", d.noClick);
                if (!d.noClick) {
                    d.active = !d.active;
                    if (d.active === true) {
                        d.fill = 'red';
                    } else {
                        d.fill = 'black';
                    }
                    updateDust();
                    updateMagnets();
                } else {
                    d.noClick = false;
                }
            });
// var text = magnets
//                 .append("text");
//
// var textLabels = text
//                     .attr("x", function(d) { return d.x; })
//                     .attr("y", function(d) { return d.y; })
//                     .text(function(d) { return d.name; })
//                     .attr("font-family", "sans-serif")
//                     .attr("font-size", "20px")
//                     .attr("fill", "red");

    var dust = svg.selectAll('.dust-group')
                        .data(fData)
                        .enter()
                        .append('g')
                        .attr('class', 'dust-group');
    dust.call(tip);
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
        .attr('fill', 'blue')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
}
