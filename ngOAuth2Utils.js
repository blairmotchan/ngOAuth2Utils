'use strict';

(function () {

    angular.module('ngOAuth2Utils', ['ngStorage'])

        .factory('$tokenService', function $tokenService($localStorage) {
            return {
                getToken: function () {
                    return $localStorage.token;
                },
                setToken: function (token) {
                    $localStorage.token = token;
                },
                setExpiresIn: function (seconds) {
                    $localStorage.expiresIn = new Date(new Date().valueOf() + (seconds * 1000));
                },
                isValidToken: function () {
                    if (this.getToken() == null || $localStorage.expiresIn == null ||
                        $localStorage.expiresIn.valueOf() < new Date().valueOf()) {
                        return false;
                    }
                    return true;
                },
                isValidAndExpiredToken: function () {
                    if (this.getToken() != null && this.getRefreshToken() != null &&
                        $localStorage.expiresIn != null && new Date().valueOf() < $localStorage.expiresIn.valueOf()) {
                        return true;
                    }
                    return false;
                },
                setRefreshToken: function (refreshToken) {
                    $localStorage.refreshToken = refreshToken;
                },
                getRefreshToken: function () {
                    return $localStorage.refreshToken;
                },
                reset: function () {
                    this.setToken(null);
                    this.setRefreshToken(null);
                    $localStorage.expiresIn = null;
                }
            };
        })

    /**
     * oauth2Config
     *  tokenEndPoint
     *  base64BasicKey
     *
     */
        .factory('$authenticationService', function $authenticationService($http, $tokenService, oauth2Config) {

            function setTokenValues(response) {
                $tokenService.setToken(response.access_token); //jshint ignore:line
                $tokenService.setExpiresIn(response.expires_in);// jshint ignore:line
                $tokenService.setRefreshToken(response.refresh_token)// jshint ignore:line
            }

            return {
                login: function (username, password) {
                    return $http({
                        method: 'GET',
                        url: oauth2Config.getAccessTokenUrl,
                        headers: {'Authorization': 'Basic ' + oauth2Config.base64BasicKey},
                        params: {
                            'grant_type': 'password',
                            'password': password,
                            'username': username
                        }
                    })
                        .success(function (response) {
                            setTokenValues(response);
                        })
                        .error(function () {
                            $tokenService.reset();
                        });
                },
                refresh: function () {
                    return $http({
                        method: 'GET',
                        url: oauth2Config.getAccessTokenUrl,
                        headers: {'Authorization': 'Basic ' + oauth2Config.base64BasicKey},
                        params: {
                            'refresh_token': $tokenService.getRefreshToken(),
                            'grant_type': 'refresh_token'
                        }
                    })
                        .success(function (response) {
                            setTokenValues(response);
                        });
                },
                logout: function () {
                    return $http({
                        method: 'DELETE',
                        url: oauth2Config.revokeTokenUrl,
                        headers: {'Authorization': 'Bearer ' + $tokenService.getToken()}
                    })
                        .success(function () {
                            $tokenService.reset();
                        });
                }
            };
        })

        .factory('$httpInterceptorService', function $httpInterceptorService($q, $location, $tokenService) {

            return {

                'request': function (config) {
                    if (!config.url.match(/oauth\/token/) && $tokenService.getToken() != null) {
                        config.headers.Authorization = 'Bearer ' + $tokenService.getToken();
                    }
                    return config;
                },
                'responseError': function (rejection) {
                    if (rejection.status === 401 || (rejection.status === 400
                        && rejection.config.params.grant_type === 'refresh_token')) {// jshint ignore:line
                        $tokenService.reset();
                        $location.path('login');
                    }
                    else if (rejection.status === 403) {
                        $location.path('access-denied');
                    }
                    return $q.reject(rejection);
                }
            };
        })

        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('$httpInterceptorService');
        }])

        .run(function ($location, $tokenService, $authenticationService, $rootScope) {
            if ($tokenService.isValidAndExpiredToken()) {
                $authenticationService.refresh();
            }
            else if (!$tokenService.isValidToken()) {
                $location.path('login');
            }
            $rootScope.$on('$routeChangeStart', function (event) {
                if (!$tokenService.isValidToken()) {
                    //prevent location change.
                    event.preventDefault();
                    $location.path('login');
                }
            });
        });

})();