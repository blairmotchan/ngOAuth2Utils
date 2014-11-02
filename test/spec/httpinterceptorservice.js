'use strict';

describe('Service: $httpInterceptorService', function () {

  // load the service's module
  beforeEach(module('ngOAuth2Utils'));

  // instantiate service
  var $httpInterceptorService, $tokenService, $httpBackend, $http, $location;
  beforeEach(inject(function (_$location_, _$httpBackend_, _$httpInterceptorService_, _$tokenService_, _$http_) {
    $httpInterceptorService = _$httpInterceptorService_;
    $tokenService = _$tokenService_;
    $httpBackend = _$httpBackend_;
    $http = _$http_;
    $location = _$location_;
  }));


  it('expects Authorization header to be ignored when requesting /ouath/token', function () {
    $tokenService.setToken('456');
    $httpBackend.expectGET(
        'http://localhost/oauth/token',
        {'Authorization': 'Basic 123', 'Accept': 'application/json, text/plain, */*'}
    ).respond(200);

    $http({
      method: 'GET',
      url: 'http://localhost/oauth/token',
      headers: {'Authorization': 'Basic 123'}
    });

    $httpBackend.flush();
  });

  it('expects Authorization Bearer to be added when there is a token', function () {
    $tokenService.setToken('456');
    $httpBackend.expectGET(
        'http://localhost',
        {'Authorization': 'Bearer 456', 'Accept': 'application/json, text/plain, */*'}
    ).respond(200);

    $http({
      method: 'GET',
      url: 'http://localhost'
    });

    $httpBackend.flush();
  });

  it('expects the login view when it is 401', function () {
    $location.path('/');
    $httpBackend.expectGET(
        'http://localhost',
        {'Accept': 'application/json, text/plain, */*'}
    ).respond(401);

    $http({
      method: 'GET',
      url: 'http://localhost'
    });

    $httpBackend.flush();

    expect($location.path()).toBe('/login');
  });

  it('expects the login view when it is a 400 after a refresh', function () {
    $location.path('/');
    $httpBackend.expectGET(
        'http://localhost/oauth/token?grant_type=refresh_token&refresh_token=444',
        {'Accept': 'application/json, text/plain, */*'}
    ).respond(400);

    $http({
      method: 'GET',
      url: 'http://localhost/oauth/token',
      params: {'grant_type': 'refresh_token', 'refresh_token': '444'}
    });

    $httpBackend.flush();

    expect($location.path()).toBe('/login');
  });

});
