'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('board', {
        url: '/board/:id',
        templateUrl: 'js/master.html',
        controller: 'BoardCtrl',
        resolve: {
        	currentBoard: function(Board, $stateParams) {
        		return Board.getOne($stateParams.id).catch(function(err) {
        			console.log(err);
        		});
        	},
        	allNotes: function(Board, $stateParams) {
        		return Board.getNotes($stateParams.id).catch(function(err) {
        			console.log(err);
        		});
        	}
        }
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
			return $http.get('api/boards/b/' + id).then(function(response) {
				return response.data;
			});
		},
		getNotes: function(id) {
			return $http.get('api/notes/board/' + id).then(function(response) {
				return response.data;
			});
		}

	};
});

app.factory('Note', function($http, $state) {
	return {
		create: function(note) {
			return $http.post('api/notes', note).then(function(response) {
				return response.data;
			});
		},
		getOne: function(id) {
			return $http.get('api/notes/' + id).then(function(response) {
				return response.data;
			});
		},
		updateOne: function(id, updateNote) {
			return $http.put('api/notes/' + id, updateNote).then(function(response) {
				return response.data;
			});
		},
		deleteOne: function(id) {
			return $http.delete('api/notes/' + id).then(function(response) {
				return response.data;
			});
		},
		upvote: function(id) {
			return $http.put('api/notes/upvote/' + id).then(function(response) {
				return response.data;
			});
		},
		downvote: function(id) {
			return $http.put('api/notes/downvote/' + id).then(function(response) {
				return response.data;
			});
		}
	};
});

app.directive('stickyNote', function(socket, Note) {
	var linker = function(scope, element, attrs) {
			element.draggable({
				stop: function(event, ui) {
					// console.log('ui position: ', ui);
					socket.emit('moveNote', {
						_id: scope.note._id,
						x: ui.position.left,
						y: ui.position.top
					});
					// update note position in database
					Note.updateOne(
						scope.note._id, 
						{
							position: {
								x: ui.position.left, 
								y: ui.position.top
							}
						}
					)
					.then(function(note){
						console.log('note with new position ');
					})
					.catch(function(err) {
						console.log('drag stop', err);
					});
				}
			});

			socket.on('onNoteMoved', function(data) {
				// Update if the same note
				if(data._id === scope.note._id) {
					element.animate({
						left: data.x,
						top: data.y
					});
				}
			});

			Note.getOne(scope.note._id)
			.then(function(note) {
				element.css('left', note.position.x + 'px');
				element.css('top', note.position.y + 'px');
				element.fadeIn('fast');
			});

		};

	var controller = function($scope, $modal) {
		var note = $scope.note;
		// Incoming
		socket.on('onNoteUpdated', function(data) {
			// Update if the same note
			if(data._id === $scope.note._id) {
				$scope.note.title = data.title;
				$scope.note.body = data.body;
			}
		});

		// Outgoing
		$scope.updateNote = function(note) {
			socket.emit('updateNote', note);
				Note.updateOne($scope.note._id, $scope.note).then(function(note) {
					$scope.note = note;
				}).catch(function(err) {
					console.log('eeeeeeerr');
				});
		};

		$scope.deleteNote = function(id) {
			$scope.ondelete({
				id: id
			});
		};

		$scope.upvote = function(id) {
			Note.upvote($scope.note._id)
			.then(function(note){
				$scope.note = note;
			})
			.catch(function(err) {
				console.log('upvote errorrrrrr ', err);
			});
		};

		$scope.downvote = function(id) {
			Note.downvote($scope.note._id)
			.then(function(note){
				$scope.note = note;
			})
			.catch(function(err) {
				console.log('upvote errorrrrrr ', err);
			});
		};

		$scope.animationsEnabled = true;

		$scope.openModal = function(size) {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'noteModal.html',
				controller: 'ModalInstanceCtrl',
				size: size,
				resolve: {
					note: function() {
						return $scope.note;
					}
				}
			});
			modalInstance.result.then(function() {
				console.log('hi modal');
			}, function() {
				console.log('bye modal');
			});
		};
	};

	return {
		restrict: 'E',
		templateUrl: 'js/stickyNote.html',
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

app.controller('BoardCtrl', function($scope, Board, Note, $state, socket, allNotes, currentBoard, $stateParams) {
	$scope.board = currentBoard;
	$scope.notes = allNotes;
	socket.emit('joinRoom', $scope.board);

	// Incoming
	socket.on('onNoteCreated', function(data) {
		$scope.notes.push(data);
	});

	socket.on('onNoteDeleted', function(data) {
		$scope.handleDeletedNoted(data.id);
	});

	// Outgoing
	$scope.createNote = function(boardId) {
		// console.log('note boardId', boardId);
		var note = {
			board: boardId,
			title: 'New Note',
			body: 'Pending',
			upvote: 0,
			downvote: 0,
			position: {
				x: 10,
				y: 50
			}
		};

		Note.create(note)
			.then(function(note) {
				$scope.notes.push(note);
				// socket.join(note.board);
				socket.emit('createNote', note);
			}).catch(function(err) {
				console.log('create note errrrr ', err);
			});
	};

	$scope.deleteNote = function(id) {
		$scope.handleDeletedNoted(id);
		socket.emit('deleteNote', {id: id});
		// console.log('deleteNote in coltroller', id);
	};

	$scope.handleDeletedNoted = function(id) {

		Note.deleteOne(id)
		// .then(Board.getNotes.bind(Board, $stateParams.id))
		.then(function(note) {
			return Board.getNotes($stateParams.id)
		})
		.then(function(notes) {
			$scope.notes = notes;
		})
		.catch(function(err) {
	        console.log(err);
	    });
	};

});

app.controller('MasterCtrl', function($scope, Board, $state, socket, $stateParams) {	
	$scope.createBoard = function() {
		Board.create($scope.board.name).then(function(board) {
			$state.go('board', {id: board._id});
			// socket.emit('newBoard', board);
		}).catch(function(err){
			console.log(err);
		});
	};
});

app.controller('ModalInstanceCtrl', function($scope, $modalInstance, note) {
	$scope.note = note;
	// $scope.ok = function() {
	// 	$modalInstance.close($scope.selected.item);
	// };
	// $scope.cancel = function() {
	// 	$modalInstance.dismiss('cancel');
	// };
});




























