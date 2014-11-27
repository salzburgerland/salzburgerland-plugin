jQuery(function ($) {

    /**
     * Disable screen bouncing.
     */
    $(document).bind('touchmove', function (e) {
        e.preventDefault();
    });


    var hammerize = function (selector, rotationStep, center, width, height, hookTap) {

        var rotation = 0;

        /**
         * Raise an event when the wheel has been tapped.
         *
         * @since 1.0.0
         *
         * @param {*} value The selected value.
         */
        function updateInput(value) {
            $(document).trigger('centerWheelPress', value);
        }

        // Init touch controls
        var wheelTouch = Hammer($(selector)[0]);
        wheelTouch.get('pan')
            .set({direction: Hammer.DIRECTION_ALL});

        // Tap and Rotation controls
        if (hookTap)
            wheelTouch.on('tap', function (el) {

                var selectedValue = d3.select(el.target).data()[0];

                if (selectedValue !== undefined) {
                    // Tap on sector
                    updateInput(selectedValue);
                } else {
                    // Tap on center
                    var elementId = $(el.target).attr('id');
                    if (elementId.indexOf('ok-button') > -1) {
                        // Which input was chosen?
                        var selectedIndex = jukebox.getSectorIndexFromRotation(rotation, data.length);
                        updateInput(data[selectedIndex]);
                    }
                }
            });

        wheelTouch.on('pan swipe', function (e) {
            // Average velocities
            var velocity = 0.5 * (Math.abs(e.velocityX) + Math.abs(e.velocityY));

            // Change sign to velocity if rotation is counter-clockwise
            var quadrant = jukebox.getEventQuadrant(selector, e);
            velocity = velocity * jukebox.rotationSignRespectingQuadrantAndMovement(quadrant, e.velocityX, e.velocityY);

            // Trigger events (only meaningful ones)
            if (jukebox.thereWasASectorSwitch(rotation, rotationStep * velocity, data.length)) {
                if (velocity < 0) {
                    $(document).trigger('rotateAntiClockwise');
                } else {
                    $(document).trigger('rotateClockwise');
                }
            }

            // Update rotation
            rotation += rotationStep * velocity;

            // Rotate wheel
            center.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ') rotate(' + rotation + ')');
        });
    };

    /**
     * Create the wheel.
     *
     * @since 1.0.0
     *
     * @param {string} selector The element selector.
     */
    function buildWheel(selector, hookTap) {

        // Clear div contents
        $(selector).empty();

        // Expand svg to parent width and to be a square
        $(selector).width('100%');
        $(selector).height($(selector).width());

        // Get size in pixel
        var width = $(selector).width();
        var height = $(selector).height();

        // Other params
        var scalingFactor = 0.5;
        var innerRadius = width * scalingFactor / 2;
        var outerRadius = width * scalingFactor;
        var interval = 0.05;
        var sectorAngle = Math.PI * 2 / data.length;
        var rotationStep = 10;

        var wheel = d3.select(selector);

        // Build arc
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(function (d, i) {
                return sectorAngle * i;
            })
            .endAngle(function (d, i) {
                return (sectorAngle * (i + 1)) - interval;
            });

        // Create grouping element and move it to the center
        var center = wheel.append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Add arc + label groups
        center.selectAll()
            .data(data)
            .enter()
            .append('g');

        // Add arcs
        center.selectAll('g')
            .append('path')
            .attr('d', arc)
            .attr('class', 'sector-button')
            .style('fill', function () {
                return "hsl(" + Math.random() * 360 + ",100%,50%)";
            });

        // Add labels
        center.selectAll('g')
            .append('text')
            .attr('class', 'sector-text')
            .attr('transform', function (d, i) {
                var info = getLabelsXYAngle(i);
                return 'rotate(' + info.angle + ',' + info.cx + ',' + info.cy + ')';
            })
            .attr('x', function (d, i) {
                return getLabelsXYAngle(i).cx;
            })
            .attr('dy', function (d, i) {
                return getLabelsXYAngle(i).cy;
            })
            .html(function (d) {
                return d;
            });

        // Add triangle to indicate current selection
        wheel.append('polygon')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('points', function () {
                var width = innerRadius / 2;
                var height = innerRadius * 1.2;
                return -width / 2 + ',' + '0 0' + -height + ', ' + width / 2 + ',0';
            })
            .style('fill', 'gray');

        // Add OK button
        wheel.append('circle')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('r', innerRadius * 0.7)
            .style('fill', 'gray')
            .attr('id', 'ok-button');

        // Add OK text
        wheel.append('text')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('id', 'ok-button-text')
            .attr('x', -10)
            .attr('dy', 0)
            .html(function (d) {
                return 'Ok';
            });

        // Utility function to create labels
        function getLabelsXYAngle(i) {
            var labelXYA = {};

            // Label rotation angle
            var angle = (sectorAngle * i) + (Math.PI / data.length);
            labelXYA.angle = (angle * 360) / (Math.PI * 2);

            // Label coordinates
            var startAngle = Math.PI / 2;
            var radius = (innerRadius + outerRadius) / 2
            labelXYA.cx = radius * Math.cos(-startAngle + (sectorAngle / 3) + (sectorAngle * i));
            labelXYA.cy = radius * Math.sin(-startAngle + (sectorAngle / 3) + (sectorAngle * i));

            return labelXYA;
        }

        hammerize(selector, rotationStep, center, width, height, hookTap);
    }

    /////////////////////////////////////////
    // Execution starts here
    var jukebox = new szJukebox();


    // Prepare forms
    var date = new Date();
    date = jukebox.convertUnixDateToNormal(date.getTime());
    $('#date-from-input').val(date);
    $('#date-to-input').val(date);
    // Add two days
    jukebox.changeDay('#date-to-input', 2);

    $('#wheel-submit').prop('disabled', true);

    // App logic variables
    var decidedFromDate = false;
    var decidedToDate = false;
    updateInputFieldFocus();

    // Wheel data
    var interests = ['biking', 'nature', 'eating', 'climbing', 'snowing', 'dancing'];
    var dates = [];
    for (var i = 0; i < 20; i++) {
        dates.push('');
    }
    var data = dates;

    // Build wheel!
    buildWheel('#wheel', true);

    // Tab switching events
    Hammer($('#select-interest-tab')[0]).on('tap', function () {
        data = interests;
        decidedFromDate = true;
        decidedToDate = true;
        updateInputFieldFocus();
        buildWheel('#wheel', false);
    });
    Hammer($('#select-date-tab')[0]).on('tap', function () {
        data = dates;
        decidedFromDate = false;
        decidedToDate = false;
        updateInputFieldFocus();
        buildWheel('#wheel', false);
    });

    Hammer($('#date-from-input')[0]).on('tap', function () {
        decidedFromDate = false;
        decidedToDate = false;
        updateInputFieldFocus();
    });

    Hammer($('#date-to-input')[0]).on('tap', function () {
        decidedFromDate = true;
        decidedToDate = false;
        updateInputFieldFocus();
    });

    // Final submission
    Hammer($('#wheel-submit')[0]).on('tap', function () {
        var fromDate = $('#date-from-input').val();
        fromDate = [fromDate, jukebox.convertNormalDateToUnix(fromDate)];
        var toDate = $('#date-to-input').val();
        toDate = [toDate, jukebox.convertNormalDateToUnix(toDate)];
        var interestsList = ($('#interest-input').val()).split(',');
        alert(fromDate + '\n' + toDate + '\n' + interestsList);
    });

    // Events fired by the wheel
    $(document).on('rotateAntiClockwise', function () {
        if (!decidedFromDate) {
            jukebox.changeDay('#date-from-input', -1);
        } else if (!decidedToDate) {
            jukebox.changeDay('#date-to-input', -1);
        }
        jukebox.syncFromToDates('#date-from-input', '#date-to-input', decidedFromDate);
    });
    $(document).on('rotateClockwise', function () {
        if (!decidedFromDate) {
            jukebox.changeDay('#date-from-input', 1);
        } else if (!decidedToDate) {
            jukebox.changeDay('#date-to-input', 1);
        }
        jukebox.syncFromToDates('#date-from-input', '#date-to-input', decidedFromDate);
    });

    // Main application logic events
    $(document).on('centerWheelPress', function (e, value) {

        // console.log('centerWheelPress');

        if (!decidedFromDate) {
            decidedFromDate = true;
        }
        else if (!decidedToDate) {
            decidedToDate = true;
            data = interests;
            buildWheel('#wheel', false);
            $('a[href="#select-interest"]').tab('show');
        } else {

            // Update interests list
            var inputValue = $('#interest-input').val();
            var chosenInterests = ( '' !== inputValue ? inputValue.split(',') : [] );

            // Remove or add the interest.
            var index = $.inArray(value, chosenInterests);
            index > -1 ? chosenInterests.splice(index, 1) : chosenInterests.push(value);

            //var chosenInterests = $('#interest-input').val();
            //chosenInterests += value + ',';
            //chosenInterests = jukebox.deleteDuplicates(chosenInterests.split(','));
            //chosenInterests = chosenInterests.join(',');
            $('#interest-input').val(chosenInterests.join(','));

            // Activate submission
            $('#wheel-submit').prop('disabled', false);
            $('#wheel-submit').text('SUBMIT');
        }
        updateInputFieldFocus();
    });

    function updateInputFieldFocus() {
        $('#date-from-input').css('font-weight', 'normal');
        $('#date-to-input').css('font-weight', 'normal');
        $('#interest-input').css('font-weight', 'normal');

        if (!decidedFromDate) {
            $('#date-from-input').css('font-weight', 'bold');
        } else if (!decidedToDate) {
            $('#date-to-input').css('font-weight', 'bold');
        } else {
            $('#interest-input').css('font-weight', 'bold');
        }
    }

});