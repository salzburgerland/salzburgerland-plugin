jQuery(function ($) {

    var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    /**
     * Hammerize the element with the specified selector.
     *
     * @since 1.0.0
     *
     * @param {string} selector
     * @param rotationStep
     * @param center
     * @param {number} width
     * @param {number} height
     * @param {[]} slices The wheel slices.
     */
    var hammerize = function (selector, rotationStep, center, width, height, slices, wheel) {

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
        wheelTouch.on('tap', function (el) {

            // When the user taps on a slice, we can get the selected value.
            var value = d3.select(el.target).data()[0];

            // If the user didn't tap on a slice, we need to get the selected value according to the wheel position.
            if (undefined === value) {

                // Check that the user pressed on the OK button, otherwise ignore.
                var elementId = $(el.target).attr('id');
                if (0 > elementId.indexOf('ok-button'))
                    return;

                // Get the selected input.
                value = slices[jukebox.getSectorIndexFromRotation(rotation, slices.length)];
            }

            // Reverse the selection and set the opacity.
            value.__selected = ! value.__selected;
            wheel.selectAll('#' + value.__id).attr('fill-opacity', value.__selected ? 1.0 : 0.5);

            // Finally call the update input.
            updateInput(value);

        });

        wheelTouch.on('pan swipe', function (e) {
            // Average velocities
            var velocity = 0.5 * (Math.abs(e.velocityX) + Math.abs(e.velocityY));

            // Change sign to velocity if rotation is counter-clockwise
            var quadrant = jukebox.getEventQuadrant(selector, e);
            velocity = velocity * jukebox.rotationSignRespectingQuadrantAndMovement(quadrant, e.velocityX, e.velocityY);

            // Trigger events (only meaningful ones)
            if (jukebox.thereWasASectorSwitch(rotation, rotationStep * velocity, slices.length)) {
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
     * @param {[]} slices The slices.
     * @param {number} wheelWidth The width/height of the wheel.
     */
    function buildWheel(selector, slices, wheelWidth) {

        // Clear div contents
        $(selector).empty();

        // Expand svg to parent width and to be a square
        $(selector).width(wheelWidth);
        $(selector).height(wheelWidth);

        // Get size in pixel
        var width = $(selector).width();
        var height = $(selector).height();

        // Other params
        var scalingFactor = 0.5;
        var innerRadius = width * scalingFactor / 2;
        var outerRadius = width * scalingFactor;
        var interval = 0.05;
        var sectorAngle = Math.PI * 2 / slices.length;
        var rotationStep = 10;

        var wheel = d3.select(selector);

        var defs = wheel.append('defs');

        // Add the OK button image.
        defs.append('pattern')
            .attr('id', 'ok-button-pattern')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('x', width / 2 - innerRadius)
            .attr('y', height / 2 - innerRadius)
            .attr('width', innerRadius * 2)
            .attr('height', innerRadius * 2)
            .append('image')
            .attr('width', innerRadius * 2)
            .attr('height', innerRadius * 2)
            .attr('xlink:href', 'http://www.clker.com/cliparts/T/8/V/V/V/G/ok-button-hi.png');

        // If the slices have an image, create their pattern here.
        for (var i = 0; i < slices.length; i++) {
            if (undefined === slices[i].image)
                continue;

            defs.append('pattern')
                .attr('id', 'slice-' + i)
                .attr('patternUnits', 'objectBoundingBox')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', '0 0 1 1')
                .attr('preserveAspectRatio', 'xMidYMid slice')
                .append('image')
                .attr('width', 1)
                .attr('height', 1)
                .attr('xlink:href', slices[i].image);
        }

        // Build arc
        var arc = d3.svg.arc()
            .innerRadius(innerRadius * 0.75)
            .outerRadius(outerRadius)
            .startAngle(function (d, i) {
                return sectorAngle * i;
            })
            .endAngle(function (d, i) {
                return sectorAngle * (i + 1) - interval;
            });

        // Create grouping element and move it to the center
        var center = wheel.append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Add arc + label groups
        center.selectAll()
            .data(slices)
            .enter()
            .append('g');

        // Add arcs
        center.selectAll('g')
            .append('path')
            .attr('id', function (d, i) {
                d.__id = 'slice-' + i;
                d.__selected = false;
                return 'slice-' + i;
            })
            .attr('d', arc)
            .attr('class', 'sector-button')
            .attr('fill', function (d, i) {
                return (undefined !== d.image)
                    ? 'url(#slice-' + i + ')'
                    : 'hsl(' + Math.random() * 360 + ', 100%, 50%)';
            })
            .attr('fill-opacity', 0.5);

        center.selectAll('g')
            .append('text')
            .attr('font-size', '10px')
            .attr('transform', function (d, i) {
                return "translate(" + (innerRadius * Math.cos(i * 2 * Math.PI / slices.length)) + "," + (innerRadius * Math.sin(i * 2 * Math.PI / slices.length)) + ")rotate(" + (i * 360 / slices.length) + ")";
            })
            .text(function (d, i) {
                if (undefined !== slices[i].label) {
                    return slices[i].label;
                }
            });


        // Add triangle to indicate current selection
        wheel.append('polygon')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('points', function () {
                var width = innerRadius / 2;
                var height = innerRadius;
                return -width / 2 + ',' + '0 0' + -height + ', ' + width / 2 + ',0';
            })
            .style('fill', '#3a6700');

        //// Add OK button
        //wheel.append('circle')
        //    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
        //    .attr('r', innerRadius)
        //    //.attr('fill', 'url(#ok-button-image)')
        //    .style('fill', 'gray')
        //    ;
        //

        // Add OK text
        wheel.append('text')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
            .attr('id', 'ok-button-text')
            .attr('x', -10)
            .attr('dy', 0)
            .html(function (d) {
                return 'Ok';
            });

        // OK button.
        wheel.append('circle')
            .attr('id', 'ok-button')
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', innerRadius)
            .attr('fill', 'url(#ok-button-pattern)');

        // Utility function to create labels
        function getLabelsXYAngle(i) {
            var labelXYA = {};

            // Label rotation angle
            var angle = (sectorAngle * i) + (Math.PI / slices.length);
            labelXYA.angle = (angle * 360) / (Math.PI * 2);

            // Label coordinates
            var startAngle = Math.PI / 2;
            var radius = (innerRadius + outerRadius) / 2;
            labelXYA.cx = radius * Math.cos(-startAngle + (sectorAngle / 3) + (sectorAngle * i));
            labelXYA.cy = radius * Math.sin(-startAngle + (sectorAngle / 3) + (sectorAngle * i));

            return labelXYA;
        }

        hammerize(selector, rotationStep, center, width, height, slices, wheel);
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
    var interests = saju_jukebox_wheel_options.interests;

// Create an array of 4 weeks with the days labels.
    var days = [];
    for (var i = 0; i < 28; i++) {
        var today = new Date();
        var weekDay = new Date();
        weekDay.setDate(today.getDate() + i);
        days.push({label: WEEKDAYS[weekDay.getDay()]});
    }

// Build wheel!
    buildWheel('#wheel--dates', days, $('#wheel-main').innerWidth());
    buildWheel('#wheel--interests', interests, $('#wheel-main').innerWidth());

// Tab switching events
    Hammer($('#select-interest-tab')[0]).on('tap', function () {
        decidedFromDate = true;
        decidedToDate = true;
        updateInputFieldFocus();
        //buildWheel('#wheel', false, interests);
    });

    Hammer($('#select-date-tab')[0]).on('tap', function () {
        decidedFromDate = false;
        decidedToDate = false;
        updateInputFieldFocus();
        //buildWheel('#wheel', false, days);
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
        //var interestsList = ($('#interest-input').val()).split(',');

        // Build the redirect to link.
        var redirectTo = saju_jukebox_wheel_options.search_slug +
            ( -1 < saju_jukebox_wheel_options.search_slug.indexOf('?') ? '&' : '?') +
            'from=' + encodeURIComponent(fromDate[0]) +
            '&to=' + encodeURIComponent(toDate[0]) +
            '&interests=' + encodeURIComponent($('#interest-input').val());

        // Redirect the user to the search page.
        window.location.href = redirectTo;

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
            //buildWheel('#wheel', false, interests);
            $('a[href="#select-interest"]').tab('show');
        } else {

            // Update interests list
            var inputValue = $('#interest-input').val();
            var chosenInterests = ( '' !== inputValue ? inputValue.split(',') : [] );

            // Remove or add the interest.
            var index = $.inArray(value.label, chosenInterests);
            index > -1 ? chosenInterests.splice(index, 1) : chosenInterests.push(value.label);

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

})
;