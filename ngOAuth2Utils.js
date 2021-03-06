'use strict';

 (function(){

// Source: src/app.js
angular.module('ngOAuth2Utils', ['ngStorage', 'ngRoute'])
    .constant('oauthConfig', {
        getAccessTokenUrl: '',
        base64BasicKey: '',
        revokeTokenUrl: '',
        loginPath: '/login',
        loginSuccessPath: '',
        interceptorIgnorePattern: / /,
        loginErrorMessage: '',
        loginFunction: null,
        forgotPasswordURL: null,
        logoutSuccessMessage: '',
        storageType: 'session',
        useRouting: true,
        unsecuredPaths: []
    })

    .config(function ($routeProvider, oauthConfig) {
        if (oauthConfig.useRouting) {
            $routeProvider
                .when('/login', {
                    controller: 'LoginCtrl',
                    templateUrl: 'oauth2Templates/login.html'
                })
                .when('/logout', {
                    controller: 'LogoutCtrl',
                    template: '<logout-message></logout-message>'
                });
        }
    })

    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('$httpInterceptorService');
    }])

    .run(function ($location, $tokenService, $authenticationService, $rootScope, oauthConfig) {
        if ($tokenService.isValidAndExpiredToken()) {
            $authenticationService.refresh();
        }
        else if (!$authenticationService.allowAnonymous($location.path()) && !$tokenService.isValidToken()) {
            $location.path(oauthConfig.loginPath);
        }
        $rootScope.$on('$routeChangeStart', function (event, next) {

            if (!$authenticationService.allowAnonymous(next.originalPath) && !$tokenService.isValidToken()) {
                $rootScope.$evalAsync(function () {
                    $location.path('/login');
                });
            }

        });
    });
// Source: src/controllers/login.js
angular.module('ngOAuth2Utils')
    .controller('LoginCtrl', function ($scope, $location, $authenticationService, oauthConfig) {
        $scope.login = function (loginDetails) {
            $scope.loginError = null;
            $authenticationService.login(loginDetails.username, loginDetails.password).then(
                function () {
                    $location.path(oauthConfig.loginSuccessPath);
                    if (oauthConfig.loginFunction) {
                        oauthConfig.loginFunction();
                    }
                },
                function (response) {
                    $scope.loginError = response.data[oauthConfig.loginErrorMessage];// jshint ignore:line
                });
        };

        if(oauthConfig.forgotPasswordURL) {
            $scope.forgotPasswordURL = oauthConfig.forgotPasswordURL;
        }
    });
// Source: src/controllers/logout.js
angular.module('ngOAuth2Utils')
    .controller('LogoutCtrl', function ($scope, $authenticationService, $tokenService, storageService, oauthConfig) {
        $authenticationService.logout()
            .then(function (response) {
                $scope.logoutSuccess = response.data[oauthConfig.logoutSuccessMessage];
            });
        storageService.getStorage().$reset({});
        $tokenService.reset();
    });
// Source: src/directives/loginform.js
angular.module('ngOAuth2Utils')
    .directive('loginForm', function () {
        return {
            restrict: 'E',
            templateUrl: 'oauth2Templates/loginform.html'
        };
    });
// Source: src/directives/logoutmessage.js
angular.module('ngOAuth2Utils')
    .directive('logoutMessage', function () {
        return {
            restrict: 'E',
            templateUrl: 'oauth2Templates/logout.html'
        };
    });
// Source: src/directives/requireauthenticated.js
angular.module('ngOAuth2Utils')
    .directive('requireAuthenticated', function ($tokenService) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                scope.$watch(function () {
                    return $tokenService.isValidToken();
                }, function () {
                    if ($tokenService.isValidToken()) {
                        element.removeClass('hidden');
                    } else {
                        element.addClass('hidden');
                    }
                });
            }
        };
    });
// Source: src/directives/requirerequireauthenticated.js
angular.module('ngOAuth2Utils')
    .directive('requireUnauthenticated', function ($tokenService) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                scope.$watch(function () {
                    return $tokenService.isValidToken();
                }, function () {
                    if (!$tokenService.isValidToken()) {
                        element.removeClass('hidden');
                    } else {
                        element.addClass('hidden');
                    }
                });
            }
        };
    });
// Source: src/oauth2Templates/templates.js
angular.module('ngOAuth2Utils').run(['$templateCache', function($templateCache) {
$templateCache.put('oauth2Templates/login.html',
    "<div class=\"row\">\n" +
    "    <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2\"></div>\n" +
    "    <div class=\"col-lg-8 col-sm-8 col-md-8 col-xs-8\">\n" +
    "        <login-form></login-form>\n" +
    "        <div ng-if=\"forgotPasswordURL\">\n" +
    "            <a id=\"forgot-password-link\" class=\"btn btn-warning\" href=\"{{forgotPasswordURL}}\"><span\n" +
    "                    class=\"fa fa-question-circle\"></span> Forgot/Lost Password</a>\n" +
    "            <br/>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2\"></div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('oauth2Templates/loginform.html',
    "<div>\n" +
    "    <div class=\"alert alert-danger login-error\" id=\"login-error\" ng-if=\"loginError\">{{loginError}}</div>\n" +
    "    <form name=\"loginForm\" novalidate ng-submit=\"login(loginDetails)\">\n" +
    "        <div class=\"form-group\">\n" +
    "            <input name=\"username\" id=\"username\" class=\"form-control\" type=\"text\" placeholder=\"username\"\n" +
    "                   ng-model=\"loginDetails.username\"\n" +
    "                   required/>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <input name=\"password\" id=\"password\" class=\"form-control\" type=\"password\" placeholder=\"password\"\n" +
    "                   ng-model=\"loginDetails.password\" required/>\n" +
    "        </div>\n" +
    "        <div class=\"form-group\">\n" +
    "            <button type=\"submit\" class=\"btn btn-primary btn-block login-button\" ng-disabled=\"loginForm.$invalid\">\n" +
    "                Login <span class=\"glyphicon glyphicon-user\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>"
  );


  $templateCache.put('oauth2Templates/logout.html',
    "<div class=\"row\">\n" +
    "    <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2\"></div>\n" +
    "    <div class=\"col-lg-8 col-sm-8 col-md-8 col-xs-8\">\n" +
    "        <div class=\"alert alert-success\" id=\"logout-message\">You have successfully logged out.</div>\n" +
    "    </div>\n" +
    "    <div class=\"col-lg-2 col-md-2 col-sm-2 col-xs-2\"></div>\n" +
    "</div>"
  );

}]);

// Source: src/services/authenticationservice.js
angular.module('ngOAuth2Utils')
    .factory('$authenticationService', function $authenticationService($http, $tokenService, oauthConfig) {

        function setTokenValues(response) {
            $tokenService.setToken(response.access_token); //jshint ignore:line
            $tokenService.setExpiresIn(response.expires_in);// jshint ignore:line
            $tokenService.setRefreshToken(response.refresh_token)// jshint ignore:line
        }

        return {
            allowAnonymous: function (targetPath) {

                if (targetPath.split('/').length > 2) {
                    targetPath = '/' + targetPath.split('/')[1];
                } else if (targetPath.split('?').length > 1) {
                    targetPath = targetPath.split('?')[0];
                }

                return oauthConfig.forgotPasswordURL === targetPath || oauthConfig.unsecuredPaths.indexOf(targetPath) > -1;
            },
            login: function (username, password) {
                return $http({
                    method: 'POST',
                    url: oauthConfig.getAccessTokenUrl,
                    headers: {'Authorization': 'Basic ' + oauthConfig.base64BasicKey},
                    data: {
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
                    method: 'POST',
                    url: oauthConfig.getAccessTokenUrl,
                    headers: {'Authorization': 'Basic ' + oauthConfig.base64BasicKey},
                    data: {
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
                    url: oauthConfig.revokeTokenUrl,
                    headers: {'Authorization': 'Bearer ' + $tokenService.getToken()}
                })
                    .success(function () {
                        $tokenService.reset();
                    });
            }
        };
    });
// Source: src/services/httpinterceptorservice.js
angular.module('ngOAuth2Utils')
    .factory('$httpInterceptorService', function $httpInterceptorService($q, $location, $tokenService, oauthConfig) {
        return {
            'request': function (config) {
                if (!config.url.match(oauthConfig.interceptorIgnorePattern) && $tokenService.getToken() != null) {
                    config.headers.Authorization = 'Bearer ' + $tokenService.getToken();
                }
                return config;
            },
            'responseError': function (rejection) {
                if (rejection.status === 401 ||
                    (rejection.status === 400 // jshint ignore:line
                    && rejection.config.data// jshint ignore:line
                    && rejection.config.data.grant_type// jshint ignore:line
                    && rejection.config.data.grant_type === 'refresh_token')) {// jshint ignore:line
                    $tokenService.reset();
                    $location.path(oauthConfig.loginPath);
                }
                return $q.reject(rejection);
            }
        };
    });
// Source: src/services/storageservice.js
angular.module('ngOAuth2Utils')
    .factory('storageService', function storageService($sessionStorage, $localStorage, oauthConfig) {
        return {
            'getStorage': function () {
                return oauthConfig.storageType === 'local' ? $localStorage : $sessionStorage;
            }
        };
    });
// Source: src/services/tokenservice.js
angular.module('ngOAuth2Utils')
    .factory('$tokenService', function $tokenService(storageService) {
        return {
            getToken: function () {
                return storageService.getStorage().token;
            },
            setToken: function (token) {
                storageService.getStorage().token = token;
            },
            setExpiresIn: function (seconds) {
                storageService.getStorage().expiresIn = new Date(new Date().valueOf() + (seconds * 1000));
            },
            isValidToken: function () {
                if (this.getToken() == null || storageService.getStorage().expiresIn == null ||
                    storageService.getStorage().expiresIn.valueOf() < new Date().valueOf()) {
                    return false;
                }
                return true;
            },
            isValidAndExpiredToken: function () {
                if (this.getToken() != null && this.getRefreshToken() != null &&
                    storageService.getStorage().expiresIn != null && new Date().valueOf() < storageService.getStorage().expiresIn.valueOf()) {
                    return true;
                }
                return false;
            },
            setRefreshToken: function (refreshToken) {
                storageService.getStorage().refreshToken = refreshToken;
            },
            getRefreshToken: function () {
                return storageService.getStorage().refreshToken;
            },
            reset: function () {
                this.setToken(null);
                this.setRefreshToken(null);
                storageService.getStorage().expiresIn = null;
            }
        };
    });
})();