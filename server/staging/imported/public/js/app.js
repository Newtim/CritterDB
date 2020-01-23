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
				templateUrl: 'assets/partials/Skills/list.html?@@hash',
				controller: '',
				resolve: .resolve
			}).
			when('/about',{
				templateUrl: 'assets/partials/about.html?@@hash'
			}).
			when('/Skills/view/:SkillsId',{
				templateUrl: 'assets/partials/Skills/view.html?@@hash',
				controller: '',
				resolve: .resolve
			}).
			when('/Skills/list',{
				templateUrl: 'assets/partials/Skills/list.html?@@hash',
				controller: '',
				resolve: .resolve
			}).
			when('/Skills/add/:SkillsId',{
				templateUrl: 'assets/partials/creature/create.html?@@hash',
				controller: 'creatureCtrl',
				resolve: creatureCtrl.resolve
			}).
			when('/publishedSkills/view/:SkillsId',{
				templateUrl: 'assets/partials/publishedSkills/view.html?@@hash',
				controller: 'publishedSkillsCtrl',
				resolve: publishedSkillsCtrl.resolve
			}).
			when('/publishedSkills/list/:SkillsType',{
				templateUrl: 'assets/partials/publishedSkills/list.html?@@hash',
				controller: 'publishedSkillsCtrl',
				resolve: publishedSkillsCtrl.resolve
			}).
			when('/publishedSkills/search',{
				templateUrl: 'assets/partials/publishedSkills/search.html?@@hash',
				controller: 'publishedSkillsCtrl',
				resolve: publishedSkillsCtrl.resolve
			}).
			when('/user/:userId/publishedbestiaries',{
				templateUrl: 'assets/partials/publishedSkills/list.html?@@hash',
				controller: 'publishedSkillsCtrl',
				resolve: publishedSkillsCtrl.resolve
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
