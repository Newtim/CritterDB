'use strict';

/* App Module */

//App Module
var myApp = angular.module('myApp', ['ngRoute','ngResource','ngMaterial','ngMessages','ngCookies','ngAnimate','ngclipboard','ngSanitize','btford.markdown','infiniteScroll','md.data.table']);

myApp.config(function ($mdThemingProvider) {

	var deepOrangeLight = $mdThemingProvider.extendPalette('deep-orange', {
		'contrastDarkColors': ["50", "100", "200", "A100"]
	});

	$mdThemingProvider.definePalette('deepOrangeLight',deepOrangeLight);

  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('deepOrangeLight');
});

//Register HTTP token auth interceptor
myApp.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('authHttpRequestInterceptor');
}]);

//Set up routing
myApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/index',{
				templateUrl: 'assets/partials/index.html?@@hash',
				controller: 'homePageCtrl',
				resolve: homePageCtrl.resolve
			}).
			when('/login',{
				templateUrl: 'assets/partials/account/login.html?@@hash',
				controller: 'userCtrl'
			}).
			when('/signup',{
				templateUrl: 'assets/partials/account/signup.html?@@hash',
				controller: 'userCtrl'
			}).
			when('/home',{
				templateUrl: 'assets/partials/bestiary/list.html?@@hash',
				controller: 'bestiaryCtrl',
				resolve: bestiaryCtrl.resolve
			}).
			when('/about',{
				templateUrl: 'assets/partials/about.html?@@hash'
			}).
			when('/bestiary/view/:bestiaryId',{
				templateUrl: 'assets/partials/bestiary/view.html?@@hash',
				controller: 'bestiaryCtrl',
				resolve: bestiaryCtrl.resolve
			}).
			when('/bestiary/list',{
				templateUrl: 'assets/partials/bestiary/list.html?@@hash',
				controller: 'bestiaryCtrl',
				resolve: bestiaryCtrl.resolve
			}).
			when('/bestiary/add/:bestiaryId',{
				templateUrl: 'assets/partials/creature/create.html?@@hash',
				controller: 'creatureCtrl',
				resolve: creatureCtrl.resolve
			}).
			when('/publishedbestiary/view/:bestiaryId',{
				templateUrl: 'assets/partials/publishedBestiary/view.html?@@hash',
				controller: 'publishedBestiaryCtrl',
				resolve: publishedBestiaryCtrl.resolve
			}).
			when('/publishedbestiary/list/:bestiaryType',{
				templateUrl: 'assets/partials/publishedBestiary/list.html?@@hash',
				controller: 'publishedBestiaryCtrl',
				resolve: publishedBestiaryCtrl.resolve
			}).
			when('/publishedbestiary/search',{
				templateUrl: 'assets/partials/publishedBestiary/search.html?@@hash',
				controller: 'publishedBestiaryCtrl',
				resolve: publishedBestiaryCtrl.resolve
			}).
			when('/user/:userId/publishedbestiaries',{
				templateUrl: 'assets/partials/publishedBestiary/list.html?@@hash',
				controller: 'publishedBestiaryCtrl',
				resolve: publishedBestiaryCtrl.resolve
			}).
			when('/creature/view/:creatureId',{
				templateUrl: 'assets/partials/creature/view.html?@@hash',
				controller: 'creatureCtrl',
				resolve: creatureCtrl.resolve
			}).
			when('/creature/edit/:creatureId',{
				templateUrl: 'assets/partials/creature/create.html?@@hash',
				controller: 'creatureCtrl',
				resolve: creatureCtrl.resolve
			}).
			when('/creature/create',{
				templateUrl: 'assets/partials/creature/create.html?@@hash',
				controller: 'creatureCtrl',
				resolve: creatureCtrl.resolve
			}).
			when('/account/newpassword',{
				templateUrl: 'assets/partials/account/newpassword.html?@@hash',
				controller: 'updateUserCtrl',
				resolve: updateUserCtrl.resolve
			}).
			otherwise({
				redirectTo: '/index'
			});
	}]);
