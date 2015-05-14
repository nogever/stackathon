'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('board', {
        url: '/board/:id',
        templateUrl: 'js/master.html',
        controller: 'BoardCtrl'
    });
});

app.factory('Board', function($http, $state) {
	return {
		create: function(name) {
			return $http.post('api/boards', {name: name}).then(function(response) {
				return response.data;
			});
		},
		getOne: function(id) {
			return $http.get('api/boards/' + id).then(function(response) {
				return response.data;
			});
		}

	};
});

app.directive('stickyNote', function(socket) {
	var linker = function(scope, element, attrs) {
			element.draggable({
				stop: function(event, ui) {
					// console.log('draggable');
					socket.emit('moveNote', {
						id: scope.note.id,
						x: ui.position.left,
						y: ui.position.top
					});
					// console.log('draggable');
				}
			});

			socket.on('onNoteMoved', function(data) {
				// Update if the same note
				console.log('onNoteMoved before', data);
				if(data.id == scope.note.id) {
					element.animate({
						left: data.x,
						top: data.y
					});
				}
				console.log('onNoteMoved after', data);
			});

			// Some DOM initiation to make it nice
			element.css('left', '10px');
			element.css('top', '50px');
			element.hide().fadeIn();
		};

	var controller = function($scope) {
		// Incoming
		socket.on('onNoteUpdated', function(data) {
			// Update if the same note
			console.log('onNoteUpdated before', data);
			if(data.id == $scope.note.id) {
				$scope.note.title = data.title;
				$scope.note.body = data.body;
			}
			console.log('onNoteUpdated after', data);
		});

		// Outgoing
		$scope.updateNote = function(note) {
			console.log('updateNote', note);
			socket.emit('updateNote', note);
		};

		$scope.deleteNote = function(id) {
			console.log('deleteNote in directive', id);
			$scope.ondelete({
				id: id
			});
		};
	};

	return {
		restrict: 'A',
		link: linker,
		controller: controller,
		scope: {
			note: '=',
			ondelete: '&'
		}
	};
});

app.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

app.controller('BoardCtrl', function($scope, Board, $state, socket, $stateParams) {
	$scope.board = {};
	Board.getOne($stateParams.id).then(function(board) {
		$scope.board = board;
	});
	$scope.notes = [];

	// Incoming
	socket.on('onNoteCreated', function(data) {
		$scope.notes.push(data);
	});

	socket.on('onNoteDeleted', function(data) {
		$scope.handleDeletedNoted(data.id);
	});

	// Outgoing
	$scope.createNote = function() {
		var note = {
			id: new Date().getTime(),
			title: 'New Note',
			body: 'Pending'
		};

		$scope.notes.push(note);
		socket.emit('createNote', note);
		// console.log('createNote in controller', note);
	};

	$scope.deleteNote = function(id) {
		$scope.handleDeletedNoted(id);

		socket.emit('deleteNote', {id: id});
		// console.log('deleteNote in coltroller', id);
	};

	$scope.handleDeletedNoted = function(id) {
		var oldNotes = $scope.notes,
		newNotes = [];

		angular.forEach(oldNotes, function(note) {
			if(note.id !== id) newNotes.push(note);
		});

		$scope.notes = newNotes;
	}
});

app.controller('MasterCtrl', function($scope, Board, $state, socket, $stateParams) {	
	$scope.createBoard = function() {
		Board.create($scope.board.name).then(function(board) {
			$state.go('board', {id: $scope.board._id})
		}).catch(function(err){
			console.log(err);
		});
	};
});






























