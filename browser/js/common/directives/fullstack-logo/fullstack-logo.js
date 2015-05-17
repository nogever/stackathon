'use strict';

app.directive('fullstackLogo', function() {

	var controller = function($scope, $element) {

		$scope.offCanvas = function() {
			angular.element('html').toggleClass('off-canvas-on');
			angular.element('.off-canvas').toggleClass('off-canvas-in')
		}

	};

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html',
        controller: controller
    };
    
});