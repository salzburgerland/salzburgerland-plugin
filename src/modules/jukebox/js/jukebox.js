angular.module('jukebox', [])
    .value('apiUrl', saju_js_options.api_url)
    .value('eventUrl', saju_js_options.event_url)
    .value('datasetUrl', saju_js_options.dataset_url)
    .value('from', saju_js_options.from)
    .value('to', saju_js_options.to)
    .value('interests', saju_js_options.interests)
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
                    .replace('{from}', encodeURIComponent( from ) )
                    .replace('{to}', encodeURIComponent( to ) )
                    .replace('{jukebox}', encodeURIComponent( jukebox ) )
                    .replace('{offset}', encodeURIComponent( offset ) )
                    .replace('{limit}', encodeURIComponent( limit ) );

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
            scope: {value: '='},
            template: '<a ng-href="{{getLink(value)}}" class="events__event" ng-style="getStyle(value)">' +
            '<div class="events__event__label" ng-bind="value.label"></div>' +
            '<div class="events__event__dates"></div>' +
            '</a>',
            link: function (scope, element, attrs) {

                // Get the link to the page view.
                scope.getLink = function (item) {
                    var label = item.label.replace(/\W/g, '-');
                    var id = item.s.substr(datasetUrl.length);
                    return eventUrl
                        .replace('{label}', label)
                        .replace('{id}', id);
                };

                // Add the getStyle method to the scope.
                scope.getStyle = function (item) {
                    if (undefined !== item.images && 0 < item.images.length)
                        return {'background-image': 'url("' + item.images[0].url + '")'};
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
        var limit = 10;

        var load = function (from, to, offset, limit) {
            EventsService.listByJukebox(from, to, $scope.interests.join(','), offset, limit)
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
