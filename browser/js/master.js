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
			return $http.post('api/boards', {name: name})
						.then(function(response) {
							return response.data;
						});
		},
		updateOne: function(id, imgUrl) {
			return $http.put('api/boards/' + id, {backgroundImg: imgUrl})
						.then(function(response) {
							return response.data;
						});
		},
		getOne: function(id) {
			return $http.get('api/boards/b/' + id)
						.then(function(response) {
							return response.data;
						});
		},
		getNotes: function(id) {
			return $http.get('api/notes/board/' + id)
						.then(function(response) {
							return response.data;
						});
		},
		updateGrid: function(id, grid) {
			return $http.put('api/boards/' + id, {grid: grid})
						.then(function(response) {
							return response.data;
						});
		},

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
		},
		uploadImage: function(id, imgUrl) {
			return $http.put('api/notes/images/' + id, imgUrl).then(function(response) {
				return response.data;
			});
		},
		addComment: function(newComment) {
			return $http.post('api/comments/', newComment).then(function(response) {
				return response.data;
			});
 		},
 		getComments: function(id) {
 			return $http.get('api/comments/' + id).then(function(response) {
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

	var controller = function($scope, $modal, Note) {
		var note = $scope.note;
		// Incoming
		socket.on('onNoteUpdated', function(data) {
			// Update if the same note
			if(data._id === $scope.note._id) {
				$scope.note.title = data.title;
				$scope.note.body = data.body;
			}
		});

		$scope.updateNote = function(note) {
			socket.emit('updateNote', note);
				Note.updateOne($scope.note._id, $scope.note).then(function(note) {
					$scope.note = note;
				}).catch(function(err) {
					console.log('eeeeeeerr');
				});
		};

		$scope.deleteNote = function(id) {
			console.log('deleting note from delete button');
			$scope.ondelete({
				id: id
			});
		};

		$scope.upvote = function(id) {
			Note.upvote($scope.note._id)
			.then(function(note){
				$scope.note = note;
				socket.emit('upvoteNote', note.upvote);
			})
			.catch(function(err) {
				console.log('upvote errorrrrrr ', err);
			});
		};

		$scope.downvote = function(id) {
			Note.downvote($scope.note._id)
			.then(function(note){
				$scope.note = note;
				socket.emit('downvoteNote', note.downvote);
			})
			.catch(function(err) {
				console.log('downvote errorrrrrr ', err);
			});
		};

		socket.on('onUpvoteNote', function(data) {
			$scope.note.upvote = data;
		});

		socket.on('onDownvoteNote', function(data) {
			$scope.note.downvote = data;
		});

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
		};

		$scope.colors = ['red', 'yellow', 'green', 'blue', 'white', 'purple', 'emerald', 'grey'];

		$scope.colorPopover = {
		    templateUrl: 'noteColor.html'
	  };

	  $scope.selectColor = function(color) {
	  	Note.updateOne($scope.note._id, {color: color})
	  		.then(function(note) {
	  			$scope.note.color = note.color;
	  			socket.emit('updateNoteColor', note);
	  		})
	  		.catch(function(err) {
	  			console.log(err);
	  		});
	  };

	  socket.on('onUpdateNoteColor', function(data) {
	  	if ($scope.note._id === data._id) {
		  	$scope.note.color = data.color;
	  	}
	  });

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

app.controller('BoardCtrl', function($scope, Board, Note, $modal, $state, socket, allNotes, currentBoard, $stateParams) {
	$scope.board = currentBoard;
	$scope.notes = allNotes;
	socket.emit('joinRoom', $scope.board);
	$scope.$emit('boardInfo', $scope.board);
	$scope.$parent.showBoardForm = true;
	$scope.$parent.$broadcast('boardCreated');
	$scope.animationsEnabled = true;

	// keep the latest background
	angular.element('#board').css('background-image', 'url(' + $scope.board.backgroundImg + ')');
	// keep the latest grid
	angular.element('.' + $scope.board.grid).addClass('grid-overlay-open');

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
		console.log('deleting note from parent controller');
		$scope.handleDeletedNoted(id);
		socket.emit('deleteNote', {id: id});
	};

	$scope.handleDeletedNoted = function(id) {

		Note.deleteOne(id)
		// .then(Board.getNotes.bind(Board, $stateParams.id))
		.then(function(note) {
			return Board.getNotes($stateParams.id);
		})
		.then(function(notes) {
			$scope.notes = notes;
		})
		.catch(function(err) {
	        console.log(err);
	    });
	};

	$scope.shareBoardModal = function(size) {
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'boardModal.html',
			controller: 'BoardModalInstanceCtrl',
			size: size,
			resolve: {
				board: function() {
					return $scope.board;
				}
			}
		});
	};

});

app.controller('MasterCtrl', function($scope, Board, $state, socket, $stateParams) {

	$scope.showBoardForm = false;
	$scope.boardtitle = 'this is board title';
	$scope.$on('boardInfo', function(event, data) {
		$scope.currentBoard = data;
	});

	$scope.createBoard = function() {
		Board.create($scope.board.name).then(function(board) {
			$state.go('board', {id: board._id});
			$scope.currentBoard = board;
			$scope.showBoardForm = true;
			// angular.element('#board').css('background-image', 'url(/images/healthy.jpg)');
			// socket.emit('newBoard', board);
		}).catch(function(err){
			console.log(err);
		});
	};

	$scope.offCanvas = function() {
		angular.element('html').toggleClass('off-canvas-on');
		angular.element('.off-canvas').toggleClass('off-canvas-in');
		angular.element('#changeBoardBg').toggleClass('cse-menu-open');
	};

	$scope.offCanvasGrid = function() {
		angular.element('html').toggleClass('off-canvas-grid-on');
		angular.element('.off-canvas-grid').toggleClass('off-canvas-grid-in');
		// angular.element('#changeBoardBg').toggleClass('cse-menu-open');
	};

	$scope.images = [
		'/images/healthy.jpg',
		'/images/city.jpg',
		'/images/rain.jpg',
		'/images/home.jpg'
	];

	$scope.switchBg = function(imagePath) {
		angular.element('#board').css('background-image', 'url(' + imagePath + ')');
		Board.updateOne($scope.currentBoard._id, imagePath)
			 .then(function(board) {
			 	socket.emit('changeBoardBg', board);
			 }).catch(function(err) {
			 	console.log(err);
			 });
	};

	$scope.isBgCollapsed = true;

	socket.on('onChangeBoardBg', function(data) {
		angular.element('#board').css('background-image', 'url(' + data.backgroundImg + ')');
	});

	$scope.grids = [
		'Column Grids',
		'Modular Grids'
	];

	$scope.switchGrid = function(grid) {
		if (grid === 'Modular Grids')
			grid = 'grid-overlay-modular'
		if (grid === 'Column Grids')
			grid = 'grid-overlay-column'
		console.log('current grid ', + $scope.currentBoard.grid);
		angular.element('.' + $scope.currentBoard.grid).removeClass('grid-overlay-open');
		angular.element('.' + grid).addClass('grid-overlay-open');
		var tempGrid = $scope.currentBoard.grid;
		Board.updateGrid($scope.currentBoard._id, grid)
			 .then(function(board) {
			 	$scope.currentBoard.grid = board.grid;
			 	var boardInfo = {
			 		previousGrid: tempGrid,
			 		currentGrid: board.grid
			 	}
			 	console.log('boardInfo ', boardInfo);
			 	socket.emit('changeBoardGrid', boardInfo);
			 }).catch(function(err) {
			 	console.log(err);
			 });
	};

	$scope.removeGrid = function() {
		var removeGrid = 'grid-overlay-none';
		angular.element('.' + $scope.currentBoard.grid).removeClass('grid-overlay-open');
		Board.updateGrid($scope.currentBoard._id, removeGrid)
			 .then(function(board) {
			 	socket.emit('removeBoardGrid', $scope.currentBoard.grid);
			 }).catch(function(err) {
			 	console.log(err);
			 });
	};

	$scope.isGridCollapsed = true;

	socket.on('onChangeBoardGrid', function(data) {
		console.log('boardInfo ', data);
		angular.element('.' + data.previousGrid).removeClass('grid-overlay-open');
		angular.element('.' + data.currentGrid).addClass('grid-overlay-open');
	});

	socket.on('onRemoveBoardGrid', function(data) {
		angular.element('.' + data).removeClass('grid-overlay-open');
	});
});

app.controller('ModalInstanceCtrl', function($scope, $modalInstance, note, Note, socket, $sce) {
	$scope.note = note;

	Note.getComments(note._id)
		.then(function(comments) {
			$scope.comments = comments;
			if (comments === null)
				$scope.comments = [];
		})
		.catch(function(err) {
			console.log(err);
		});

	$scope.test = {};
	  
	$scope.addComment = function() {
		$scope.newComment.note = note._id;
	  	Note.addComment($scope.newComment).then(function(comment) {
	  		$scope.comments.push(comment);
	  	}).catch(function(err) {
	  		console.log(err);
	  	});
	};


	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
	// add filepicker API
	filepicker.setKey("AYlHStA5UQh6tbkyxrBNfz");
	$scope.addMedia = function() {
		filepicker.pick(
			{
				mimetype: ["image/*", 'text/plain'],
				container: 'modal',
				services: ['COMPUTER', 'URL', 'GMAIL']
			},

  			function(data){
  				// add media to database
				Note.uploadImage(
					$scope.note._id, 
					{ image: data.url }
				)
				.then(function(note){
					$scope.note = note;
					socket.emit('updateNote', note);
				})
				.catch(function(err) {
					console.log('new image upload error ', err);
				});

			},

			function(error) {
				console.log('filepicker error ', error.toString());
			}
		);
	};

	var notebody = $scope.note.body.replace(/\n/g, '<br />');
	$scope.notebody = $sce.trustAsHtml(notebody);

});

app.controller('BoardModalInstanceCtrl', function($scope, $modalInstance, board) {
	$scope.board = board;
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
});




























