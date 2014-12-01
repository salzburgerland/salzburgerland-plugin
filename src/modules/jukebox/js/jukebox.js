angular.module('jukebox', [])
    .value('apiUrl', saju_js_options.api_url)
    .value('eventUrl', saju_js_options.event_url)
    .value('datasetUrl', saju_js_options.dataset_url)
    .value('from', saju_js_options.from)
    .value('to', saju_js_options.to)
    .value('interests', saju_js_options.interests)
/**
 * A date filter that shows the date and the time component only if the time is not midnight.
 *
 * @since 1.0.0
 *
 * @param {string} input The input date (yyyy-MM-dd'T'HH:mm:ss+hh:mm format).
 * @param {string} dateFormat The format to apply to the date component.
 * @param {string} timeFormat The format to apply to the time component.
 *
 * @return The formatted date (and time) string.
 */
    .filter('dateString', [function () {
        return function (input, dateFormat, timeFormat) {

            var date = moment(input);

            // Check if the time component is different from midnight.
            if (null === input.match(/.+T00:00:00\+\d{2}:\d{2}/i)) {
                return date.tz('Europe/Vienna').format(dateFormat + timeFormat);
            }

            return date.tz('Europe/Vienna').format(dateFormat);

        }
    }])
    .service('HolidayThemesService', ['apiUrl', '$http', function (apiUrl, $http) {

        var service = {};

        /**
         * Queries the list of Holiday Themes.
         *
         * @returns a promise for an *$http* request.
         */
        service.list = function () {

            return $http({
                method: 'GET',
                url: apiUrl + 'holiday-themes&format=json'
            });

        };

        return service;

    }])
    .service('EventsService', ['apiUrl', 'datasetUrl', '$http', function (apiUrl, datasetUrl, $http) {

        var service = {};

        /**
         * Queries the list of Events.
         *
         * @since 1.0.0
         *
         * @param {string} from A from date (yyyy-mm-dd).
         * @param {string} to   A to date (yyyy-mm-dd).
         * @param {int} offset  The offset (zero-based).
         * @param {int} limit   The maximum number of results.
         * @returns a promise for an *$http* request.
         */
        service.list = function (from, to, offset, limit) {

            var url = apiUrl + 'events&from={from}&to={to}&offset={offset}&limit={limit}&format=json'
                    .replace('{from}', from)
                    .replace('{to}', to)
                    .replace('{offset}', offset)
                    .replace('{limit}', limit);

            return $http({method: 'GET', url: url});

        };

        /**
         * Queries the list of Events.
         *
         * @since 1.0.0
         *
         * @param {string} from A from date (yyyy-mm-dd).
         * @param {string} to   A to date (yyyy-mm-dd).
         * @param {int} offset  The offset (zero-based).
         * @param {int} limit   The maximum number of results.
         * @returns a promise for an *$http* request.
         */
        service.listByJukebox = function (from, to, jukebox, offset, limit) {

            var url = apiUrl + 'jukebox-events&from={from}&to={to}&jukebox={jukebox}&offset={offset}&limit={limit}&format=json'
                    .replace('{from}', encodeURIComponent(from))
                    .replace('{to}', encodeURIComponent(to))
                    .replace('{jukebox}', encodeURIComponent(jukebox))
                    .replace('{offset}', encodeURIComponent(offset))
                    .replace('{limit}', encodeURIComponent(limit));

            return $http({method: 'GET', url: url});

        };

        /**
         * Get the images for the specified event Id.
         *
         * @param {string} id The event Id (an URI).
         * @returns a promise for an *$http* request.
         */
        service.getImages = function (id) {

            // Get only the path.
            var path = id.substring(datasetUrl.length);

            var url = apiUrl + 'event-images&id={id}&format=json'
                    .replace('{id}', path);

            return $http({method: 'GET', url: url});

        };

        /**
         * Get the subjects for the specified event Id.
         *
         * @param {string} id The event Id (an URI).
         * @returns a promise for an *$http* request.
         */
        service.getSubjects = function (id) {

            // Get only the path.
            var path = id.substring(datasetUrl.length);

            var url = apiUrl + 'event-classifications&id={id}&format=json'
                    .replace('{id}', path);

            return $http({method: 'GET', url: url});

        };

        // Return the service instance.
        return service;

    }])
/**
 * The *sl-event* tag displays a tile with the event information. The image is loaded automatically when added to the
 * event instance.
 */
    .directive('slEvent', ['datasetUrl', 'eventUrl', function (datasetUrl, eventUrl) {

        return {
            restrict: 'E',
            scope: {
                value: '=',
                index: '=',
                events: '='
            },
            template: '<a ng-click="open(value)" ng-class="getClass(value)" ng-style="getStyle(value)">' +
            '<div class="events__event__label" ng-bind="value.label"></div>' +
            '<div class="events__event__dates" ng-bind="value.start | dateString:\'ddd D/MM/YYYY\':\' @ H:mm\'"></div>' +
            '</a>',
            link: function (scope, element, attrs) {

                // Get the link to the page view.
                scope.getLink = function (item) {
                    console.log(item);
                    var label = item.label.replace(/\W/g, '-');
                    var id = item.s.substr(datasetUrl.length);
                    return eventUrl
                        .replace('{label}', label)
                        .replace('{id}', id);
                };

                scope.getClass = function (item) {
                    return 'events__event ' + item.jukebox.substring(item.jukebox.lastIndexOf('/') + 1);
                };

                // Add the getStyle method to the scope.
                scope.getStyle = function (item) {

                    //if (undefined === item.imageUrl || undefined === item.images || 0 === item.images.length || undefined === item.images[0].url)
                    //    return;

                    var url = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&width=200&url=' +
                        encodeURIComponent(item.imageUrl);

                    return {'background-image': 'url("' + url + '")'};
                };

                scope.open = function (item) {

                    // Get the link to the event.
                    var link = scope.getLink(item);

                    // The close function.
                    var closeFn = 'jQuery(\'body\').css(\'overflow\', \'auto\').scrollTop(' + jQuery('body').scrollTop()
                        + '); jQuery(this).parent().remove();';

                    // Lock the body.
                    jQuery('body')
                        .scrollTop(0)
                        .css('overflow', 'hidden');

                    // Create the overlay DIV.
                    var fullscreen = jQuery('<div class="fullscreen"><div class="fullscreen__close" onclick="' + closeFn + '"></div></div>')
                        .appendTo('body');

                    // Load the remote data.
                    var inner = jQuery('<div>Loading...</div>').appendTo(fullscreen)
                        .load(link);


                    // Get the current index.
                    var index = scope.index;

                    // Handle the swipes.
                    var hammer = new Hammer(inner[0]);
                    hammer.get('swipe').set({
                        direction: Hammer.DIRECTION_HORIZONTAL,
                        velocity: 0.3
                    });
                    hammer.on('swipe', function (ev) {

                        // Previous.
                        if (ev.direction === Hammer.DIRECTION_RIGHT) {
                            index = ( 0 === index ? scope.events.length - 1 : index - 1 );
                        }

                        // Next.
                        if (ev.direction === Hammer.DIRECTION_LEFT) {
                            index = ( ( scope.events.length - 1 ) === index ? 0 : index + 1 );
                        }

                        inner.html('Loading...').load(scope.getLink(scope.events[index]));
                    });


                };

            }
        }
    }])
/**
 * The Search Controller reads the search parameters, performs the search and returns the results for display.
 *
 * @since 1.0.0
 */
    .controller('SearchController', ['from', 'to', 'interests', 'EventsService', 'HolidayThemesService', '$filter', '$scope', function (from, to, interests, EventsService, HolidayThemesService, $filter, $scope) {

        // Gather the search parameters.
        $scope.from = from;
        $scope.to = to;
        $scope.interests = interests;

        // The result array.
        $scope.events = [];

        var offset = 0;
        var limit = 20;

        var load = function (from, to, offset, limit) {
            EventsService.listByJukebox(from, to, $scope.interests.join(','), offset, limit)
                .success(function (data, status, headers, config) {

                    $scope.events = $scope.events.concat(data);

                    // If the number of returned events equals the limit, load more events.
                    if (limit === data.length)
                        setTimeout(function () {
                            load(from, to, offset + limit, limit);
                        }, 1);
                });
        };

        load($scope.from, $scope.to, offset, limit);

    }])
    .controller('FormController', ['EventsService', 'HolidayThemesService', '$filter', '$scope', function (EventsService, HolidayThemesService, $filter, $scope) {

        // Set the initial dates.
        var from = new Date();
        var to = new Date();
        to.setDate(to.getDate() + 1);

        $scope.from = $filter('date')(from, 'yyyy-MM-dd');
        $scope.to = $filter('date')(to, 'yyyy-MM-dd');

        // Ensure to is no less than to.
        $scope.$watch('from', function () {
            if ($scope.to < $scope.from)
                $scope.to = $scope.from;
        });

        $scope.$watch('to', function () {
            if ($scope.to < $scope.from)
                $scope.from = $scope.to;
        });


        // Initialize the holiday themes.
        $scope.holidayThemes = [];
        $scope.selectedHolidayThemes = [];

        HolidayThemesService.list()
            .success(function (data, status, headers, config) {

                // Update the list of Holiday Themes.
                $scope.holidayThemes = data;
            });


        $scope.isEventVisible = function (event) {

            var selected = $filter('filter')($scope.holidayThemes, {enabled: true});

            // No theme selected: show everything.
            if (0 === selected.length)
                return true;

            if (undefined === event.subjects)
                return false;

            for (var i = 0; i < event.subjects.length; i++) {
                for (var j = 0; j < selected.length; j++) {
                    if (event.subjects[i].subject === selected[j].s) {
                        return true;
                    }
                }
            }

            return false;

        };

        $scope.events = [];

        // Submit the search.
        $scope.submit = function () {

            $scope.events = [];
            var offset = 0;
            var limit = 10;

            var load = function (from, to, offset, limit) {
                EventsService.list(from, to, offset, limit)
                    .success(function (data, status, headers, config) {
                        // Update the list of Holiday Themes.

                        angular.forEach(data, function (value, key) {
                            EventsService.getImages(value.s)
                                .success(function (data, status, headers, config) {
                                    value.images = data;
                                });

                            EventsService.getSubjects(value.s)
                                .success(function (data, status, headers, config) {
                                    value.subjects = data;
                                });
                        });

                        $scope.events = $scope.events.concat(data);

                        // If the number of returned events equals the limit, load more events.
                        if (limit === data.length)
                            setTimeout(function () {
                                load(from, to, offset + limit, limit);
                            }, 1);
                    });
            };

            load($scope.from, $scope.to, offset, limit);

        };

    }]);
