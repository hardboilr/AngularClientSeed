/**
 * Created by sebastiannielsen on 08/04/2016.
 */
var myApp = angular.module('myApp', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'index.html',
            controller: 'Controller'
        });
        $routeProvider.when('/names', {
            templateUrl: 'names/names.html',
            controller: 'Controller'
        });
        $routeProvider.when('/hellos', {
            templateUrl: 'hellos/hellos.html',
            controller: 'Controller'
        });
    }]);

myApp.controller('Controller', function ($scope, $http, $window) {
    $scope.user = {username: '', password: ''};
    $scope.isAuthenticated = false;

    $scope.submit = function () {
        $http
            .post('http://nodeserver-hardboilr.rhcloud.com/authenticate', $scope.user)
            .success(function (data, status, headers, config) {
                console.log('Authentication success!');
                $window.sessionStorage.token = data.token;
                $scope.isAuthenticated = true;
                $scope.error = false;
            })
            .error(function (data, status, headers, config) {
                console.log('Authentication failure!');
                // Erase the token if the user fails to log in
                delete $window.sessionStorage.token;
                $scope.isAuthenticated = false;

                // Handle login errors here
                $scope.error = true;
                $scope.msg = 'Error: Invalid user or password';
            });
    };

    $scope.logout = function () {
        $scope.isAuthenticated = false;
        delete $window.sessionStorage.token;
    };

    $scope.fetchNames = function () {
        console.log('fething names');
        $http({url: 'http://nodeserver-hardboilr.rhcloud.com/api/names', method: 'GET'})
            .success(function (data, status, headers, config) {
                console.log('success');
                console.log(data);
                $scope.names = data;
            })
            .error(function (data, status, headers, config) {
                $scope.error = true;
                $scope.msg = 'Something went wrong';
            });
    };

    $scope.fetchHellos = function () {
        console.log('fething hellos');
        $http({url: 'http://nodeserver-hardboilr.rhcloud.com/api/hellos', method: 'GET'})
            .success(function (data, status, headers, config) {
                $scope.hellos = data;
            })
            .error(function (data, status, headers, config) {
                $scope.error = true;
                $scope.msg = 'Something went wrong';
            });
    };

});

myApp.factory('authInterceptor', function ($rootScope, $q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                console.log('sending token ->');
                console.log($window.sessionStorage.token);
                config.headers.Authorization = $window.sessionStorage.token;
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401) {
                // handle the case where the user is not authenticated
            }
            return response || $q.when(response);
        }
    };
});

myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});