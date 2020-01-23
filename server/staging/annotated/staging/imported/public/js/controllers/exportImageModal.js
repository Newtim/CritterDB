
var exportImageCtrl = function($scope,creature,html2canvas,$location,$mdDialog) {
	const html2canvasOptions = {
		useCORS: true
	};
	$scope.creature = creature;

	$scope.image = {
		width: 500,
		background: true,
		border: true,
		landscape: false,
		showCRTag: false
	};
	$scope.$watch("image.background",function(newValue,oldValue){
		if(oldValue!=newValue)
			$scope.image.border = newValue;
	},true);
	$scope.$watch("image.landscape",function(newValue,oldValue){
		if(oldValue!=newValue && newValue==true)
			$scope.image.showCRTag = false;
	},true);

	$scope.getStatBlockStyle = function(){
		var style = {
			'width': $scope.image.width + 'px',
			'min-width': $scope.image.width + 'px',
			'max-height': '100%'
		};
		return(style);
	}

	$scope.testStyle = function(){
		return {};
	}

	$scope.getBackgroundStyle = function(){
		var style = {
			'box-shadow': 'none'
		};
		if(!$scope.image.border){
			style.border = "none";
		}
		if(!$scope.image.background)
			style.background = "none";
		if($scope.image.landscape){
			style['column-count'] = 2;
			style['-webkit-column-count'] = 2;
			style['-moz-column-count'] = 2;
			style['overflow'] = "hidden";
		}
		return(style);
	}

	$scope.saveImage = function(){
		var element = document.getElementById('stat-block');
		html2canvas.render(element, html2canvasOptions).then(function(canvas){
			var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

			var link = document.createElement('a');
			link.download = $scope.creature.name+".png";
			link.href = image;
			link.click();
		});
	}

	$scope.cancel = function() {
    $mdDialog.cancel();
  };
}
exportImageCtrl.$inject = ["$scope", "creature", "html2canvas", "$location", "$mdDialog"];

angular.module('myApp').controller('exportImageCtrl',exportImageCtrl);
