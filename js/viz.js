function render(id, fData) {
    /**************************************************************************/
    /* BEGIN: initial variables                                               */
    /**************************************************************************/
    /**
     * General info about the window and the visualization
     */
    var panelHeight = 50;
    // var width = window.innerWidth;
    // var height = window.innerHeight;
    var width = 640;
    var height = 480;
    var padding = 10;
    var dustRadius = 5;
    var magnetRadius = 20;

    var myId = parseInt(Math.random() * 100000);
    var fb = new Firebase('https://dustandmagnet.firebaseio.com/session/1/');
    var magnetState = {};
    fb.on('value', function(data) {
      magnetState = data.val() || {};
      for (var magnetId in magnetState) {
        var magnet = magnetState[magnetId];
        if (!magnet.owner || magnet.owner != myId) {
          if (!!magnet.x && !!magnet.y)
            _moveMagnet(d3.select("#" + magnetId), magnet.x, magnet.y);
          }
          if (!!magnet.r) {
            _resizeMagnet(d3.select("#" + magnetId), magnet.r);
          }
          if (magnet.active !== undefined) {
            _setActiveMagnet(d3.select("#" + magnetId), !!magnet.active);
          }
      }
    });

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
                .on("drag", dragmove)
                .on("dragend", function() { releaseMagnet(this); });

    function dragmove(d) {
        if (!d.pinch) {
          moveMagnet(
            this,
            Math.max(d.rad, Math.min(width - d.rad, d3.event.x)),
            Math.max(d.rad, Math.min(height - d.rad, d3.event.y)));
        }
    }

    function releaseMagnet(magnet) {
      magnet = d3.select(magnet);
      fb.child(magnet.attr('id')).child('owner').remove();
    }

    function isAvailableMagnet(magnetId) {
      return !magnetState[magnetId] || !magnetState[magnetId].owner || magnetState[magnetId].owner == myId;
    }

    function moveMagnet(magnet, x, y) {
      magnet = d3.select(magnet);
      if (isAvailableMagnet(magnet.attr('id'))) {
        var claim = {
          'owner': myId,
          'x': x,
          'y': y
        };
        _updateMagnet(magnet.attr('id'), claim);
        _moveMagnet(magnet, x, y);
      }
    }

    function resizeMagnet(magnet, x, y, r) {
      magnet = d3.select(magnet);
      if (isAvailableMagnet(magnet.attr('id'))) {
        var claim = {
          'owner': myId,
          'r': r,
          'x': x,
          'y': y
        };
        _updateMagnet(magnet.attr('id'), claim);
        _resizeMagnet(magnet, r);
        _moveMagnet(magnet, x, y);
      }
    }

    function toggleMagnet(magnet) {
      magnet = d3.select(magnet);
      if (isAvailableMagnet(magnet.attr('id'))) {
        _toggleMagnet(magnet);
        var claim = {
          'owner': myId,
          'active': !!magnet.datum().active
        };
        _updateMagnet(magnet.attr('id'), claim, function() {
          releaseMagnet(magnet);
        });
      }
    }

    function _moveMagnet(magnet, x, y) {
      var d = magnet.datum();
      magnet.select('.magnet-circle').attr('cx', d.x = x).attr('cy', d.y = y);
    }

    function _resizeMagnet(magnet, r) {
      var d = magnet.datum();
      magnet.select('.magnet-circle').attr('r', d.rad = r);
    }

    function _toggleMagnet(magnet) {
      var d = magnet.datum();
      d.active = !d.active;
      magnet.select('.magnet-circle').attr('fill', function(d) {
        return d.active ? 'red' : 'black';
      });
    }

    function _setActiveMagnet(magnet, active) {
      var d = magnet.datum();
      d.active = active;
      magnet.select('.magnet-circle').attr('fill', function(d) {
        return d.active ? 'red' : 'black';
      });
    }

    function _updateMagnet(magnet, opts, callback) {
      opts = opts || {};
      if (!callback) { callback = function(){}; }
      var currState = magnetState[magnet];
      for (var opt in opts) {
        currState[opt] = opts[opt];
      }
      fb.child(magnet).set(currState, callback);
    }

    d3.timer(updateDust);

    function updateDust() {
        d3.selectAll('.dust-circle')
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
                        .attr('id', function(d) { return d.name; })
                        .call(tip)
                        .call(drag)
                        .each(function(d) {
                            var self = this;
                            var hammertime = new Hammer(self, {
                                prevent_default: true,
                            });
                            hammertime.get('pinch').set({ enable: true });
                            hammertime.on('pinchstart', function(ev) {
                              var magnet = d3.select(self).datum();
                              magnet.pinch = true;
                            });
                            hammertime.on('pinch', function(ev) {
                                var dx = ev.pointers[0].pageX - ev.pointers[1].pageX;
                                var dy = ev.pointers[0].pageY - ev.pointers[1].pageY;
                                var x = (ev.pointers[0].pageX + ev.pointers[1].pageX) / 2;
                                var y = (ev.pointers[0].pageY + ev.pointers[1].pageY) / 2;
                                resizeMagnet(self, x, y, Math.sqrt(dx*dx + dy*dy));
                            });
                            hammertime.on('pinchend', function(ev) {
                              var magnet = d3.select(self).datum();
                              magnet.pinch = false;
                              releaseMagnet(self);
                            });
                            hammertime.on('tap', function(ev) {
                              toggleMagnet(self);
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
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

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
