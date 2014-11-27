var szJukebox = function () {
};

jQuery(function ($) {

    /**
     * Returns in which quadrant of an elemnent there was an event (event is in absolute coordinates)
     *
     * @since 1.0.0
     *
     * @param selector
     * @param e
     * @returns {number}
     */
    szJukebox.prototype.getEventQuadrant = function (selector, e) {
        var x = e.center.x;
        var y = e.center.y;
        var svgCenter = {
            x: $(selector).offset().left - $(window).scrollLeft() + ($(selector).width() / 2), // Taking into account scrolling
            y: $(selector).offset().top - $(window).scrollTop() + ($(selector).width() / 2)   // It's a square!
        };

        if (x > svgCenter.x && y < svgCenter.y)
            return 1;
        if (x > svgCenter.x && y > svgCenter.y)
            return 2;
        if (x < svgCenter.x && y > svgCenter.y)
            return 3;
        if (x < svgCenter.x && y < svgCenter.y)
            return 4;
    };

    /**
     * Decide direction of rotation by observing quadrant and velocities of swipe.
     * Could have be written in much less code, but then it would be mad-gerogliphic style
     *
     * @since 1.0.0
     *
     * @param quadrant
     * @param vX
     * @param vY
     * @returns {*}
     */
    szJukebox.prototype.rotationSignRespectingQuadrantAndMovement = function (quadrant, vX, vY) {
        if (quadrant === 1) {
            if (Math.abs(vX) > Math.abs(vY)) {
                return -this.sign(vX);
            } else {
                return -this.sign(vY);
            }
        }
        if (quadrant === 2) {
            if (Math.abs(vX) > Math.abs(vY)) {
                return this.sign(vX);
            } else {
                return -this.sign(vY);
            }
        }
        if (quadrant === 3) {
            if (Math.abs(vX) > Math.abs(vY)) {
                return this.sign(vX);
            } else {
                return this.sign(vY);
            }
        }
        if (quadrant === 4) {
            if (Math.abs(vX) > Math.abs(vY)) {
                return -this.sign(vX);
            } else {
                return this.sign(vY);
            }
        }

        // Exceptions solved
        return 1;
    };

    /**
     * Deduce if pointed sector changed based on rotation of wheel and its derivative
     *
     * @since 1.0.0
     *
     * @param rotation
     * @param delta
     * @param nSectors
     * @returns {boolean}
     */
    szJukebox.prototype.thereWasASectorSwitch = function (rotation, delta, nSectors) {
        var indexBefore = this.getSectorIndexFromRotation(rotation, nSectors);
        var indexNow = this.getSectorIndexFromRotation(rotation + delta, nSectors);

        if (indexBefore !== indexNow) {
            return true;
        }
        return false;
    }


    /**
     * Deduce index of sector from rotation
     *
     * @since 1.0.0
     *
     * @param rotation
     * @param nSectors
     * @returns {number}
     */
    szJukebox.prototype.getSectorIndexFromRotation = function (rotation, nSectors) {
        var actualRotation = rotation % 360;
        if (actualRotation > 0) {
            actualRotation = Math.abs(360 - actualRotation);
        } else {
            actualRotation = Math.abs(actualRotation);
        }
        var selectedIndex = (actualRotation * nSectors) / 360;
        return Math.floor(selectedIndex);
    };

    /**
     * @since 1.0.0
     *
     * @param x
     * @returns {number}
     */
    szJukebox.prototype.sign = function (x) {
        return ( x >= 0 ? 1 : -1)
    };

    /**
     * Change the date contained in $(selector) by the number of day specified.
     *
     * @since 1.0.0
     *
     * @param {string} selector The element selector.
     * @param {number} numberOfDays The number of days to add (or remove).
     */
    szJukebox.prototype.changeDay = function(selector, numberOfDays) {
        var date = $(selector).val();
        // console.log('1 : ' + date);
        date = this.convertNormalDateToUnix(date);
        // console.log('2 : ' + date);
        date += numberOfDays * 86400000; // (number of days) * (milliseconds in a day)
        // console.log('3 : ' + date);
        date = this.convertUnixDateToNormal(date);
        // console.log('4 : ' + date);
        $(selector).val(date);
    };

    /**
     *
     * @since 1.0.0
     *
     * @param {number} unixTime
     * @returns {string} A date.
     */
    szJukebox.prototype.convertUnixDateToNormal = function(unixTime) {

        // console.log( unixTime );

        var date = new Date(unixTime);

        var dateString = date.getFullYear() + '-' +
            this.padLeft(date.getMonth() + 1, 2, "0") + '-' +
            this.padLeft(date.getDate(), 2, "0");

        // console.log( dateString );

        return dateString;
    };

    /**
     * Pads left the specified character until the size is reached. Note that the string is not truncated if its length is
     * already over the expected size.
     *
     * @since 1.0.0
     *
     * @param {*} string The input string.
     * @param {number} size The expected size.
     * @param {string} char The character to prepend to the string.
     * @returns {string} A padded string.
     */
    szJukebox.prototype.padLeft = function(string, size, char) {

        var input = new String(string);
        while (size > input.length) {
            input = char.concat(input)
        }
        ;

        return input;
    };

    /**
     * Assumes date string in format "yyyy-mm-dd"
     *
     * @since 1.0.0
     *
     * @param {string} date Date string in format "yyyy-mm-dd"
     * @returns {number}
     */
    szJukebox.prototype.convertNormalDateToUnix = function(date) {
        return (new Date(date)).getTime();
    };

// Delete duplicate elements in an array
    szJukebox.prototype.deleteDuplicates = function(list) {
        var cleanList = [];
        for (var i = 0; i < list.length; i++) {
            if (cleanList.indexOf(list[i]) === -1) {
                cleanList.push(list[i]);
            }
        }
        return cleanList;
    };

    /**
     * Sync dates so arriving date is always >= than departing date
     * *departing* param is true when last modified date is the departing date.
     *
     * @since 1.0.0
     *
     * @param {string} selectorFrom The date from element selector.
     * @param {string} selectorTo The date to element selector.
     * @param {boolean} departing The departing flag.
     */
    szJukebox.prototype.syncFromToDates = function(selectorFrom, selectorTo, departing) {
        var from = $(selectorFrom).val();
        from = this.convertNormalDateToUnix(from);

        var to = $(selectorTo).val();
        to = this.convertNormalDateToUnix(to);

        var dayDifference = (from - to) / 86400000;
        // console.log(departing, from, to, dayDifference);

        if (!departing && from > to) {
            this.changeDay(selectorTo, dayDifference);
        }
        if (departing && from > to) {
            this.changeDay(selectorFrom, -dayDifference);
        }
    };

});
