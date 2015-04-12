'use strict';

describe('Controller: LoginCtrl', function () {

    var LoginCtrl,
        scope,
        $authenticationService,
        $location,
        $q,
        count,
        oauthConfig;

    // load the controller's module
    beforeEach(module('ngOAuth2Utils'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _$q_, _$location_, _oauthConfig_) {
        count = 0;
        oauthConfig = _oauthConfig_;
        oauthConfig.loginSuccessPath = '/loginSuccessPath';
        oauthConfig.loginErrorMessage = 'error_description';
        oauthConfig.loginFunction = function () {
            count += 1;
        };
        $authenticationService = jasmine.createSpyObj('$authenticationService', ['login', 'getToken']);
        $location = _$location_;

        $q = _$q_;

        scope = $rootScope.$new();

        LoginCtrl = $controller('LoginCtrl', {
            $scope: scope,
            $authenticationService: $authenticationService,
            $location: $location,
            oauthConfig: oauthConfig
        });
    }));


    it('it should call the authentication service to log in', function () {
        $authenticationService.login.andReturn($q.when({
            data: {
                'access_token': '123',
                'refresh_token': '456',
                'token_type': 'bearer'
            }
        }));

        scope.login({username: 'user', password: 'password'});

        scope.$digest();

        expect($location.path()).toBe('/loginSuccessPath');
        expect($authenticationService.login).toHaveBeenCalledWith('user', 'password');
    });

    it('it should call the login call back', function () {
        $authenticationService.login.andReturn($q.when({
            data: {
                'access_token': '123',
                'refresh_token': '456',
                'token_type': 'bearer'
            }
        }));

        scope.login({username: 'user', password: 'password'});

        scope.$digest();

        expect(count).toBe(1);
        expect($authenticationService.login).toHaveBeenCalledWith('user', 'password');
    });

    it('should return a null token from the authentication service', function () {
        $authenticationService.login.andReturn($q.reject({
            data: {'error_description': 'Bad Credentials'}
        }));

        scope.login({username: 'user', password: 'password'});

        scope.$digest();

        expect(scope.accessToken).toEqual(null);
    });

    it('it should not log in', function () {
        $authenticationService.login.andReturn($q.reject({
            data: {'error_description': 'Bad Credentials'}
        }));

        scope.login({username: 'user', password: 'password'});

        scope.$digest();

        expect($authenticationService.login).toHaveBeenCalledWith('user', 'password');
        expect(scope.loginError).toEqual('Bad Credentials');
    });


});