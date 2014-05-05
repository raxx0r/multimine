
	Accounts.onLogin(function(data){
		Meteor.users.update({_id: data.user._id}, {$set:{"profile.online":true}})
	})


	Accounts.onCreateUser(function(options, user) {
	  user.profile = options.profile ? options.profile : {online: false};
	  return user;
	});


	Meteor.publish('game', function(args){
		return Game.find({"hostName": "AggeFan"});
	});

	Meteor.publish('allUsers', function(args){
		return Meteor.users.find({"profile.online": true}, {fields:{'emails':1, 'profile.score': 1, 'profile.revealed': 1}});
	});
	//Meteor.publish('userData', function(){return Meteor.users.find()	});

	Meteor.methods({
		createBoard: function(_gameName, _hostName, w, h){
			width = w;
			height = h;
			hostName = _hostName;
			var pos = "";

			var _board = {};

			//Place RandomMines, init the board
			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					pos = i + "_" + j;
					var obj = {};
					obj['checked'] = 0;
					obj['isMine'] = Math.round(Math.random()*0.6);
					obj['surroundingMines']= 0;
					_board[pos] = obj;

				}
			}

			//calculate all the surrounding mines
			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					_board[i+'_'+j].surroundingMines = checkSurroundingsForMines(_board, {x:i, y:j});

				}
			}

			var gameID = Game.insert({hostName: hostName, hostName: _hostName,
				board: _board, width: w, height: h, version: 0 });
			
			

			console.log("CREATED GAME")

			return gameID;
		},
		rightClick: function(_hostName, coord){
			x = coord.x;
			y = coord.y;

			var key = "board." + x + "_" + y + ".isMine";
			var action = {};
			action[key]

			var find = Game.find({hostName: _hostName}).fetch()
			var isMine =find[0].board[x+'_'+y].isMine;

			console.log(isMine)

			if(isMine == 1){
			//Om hittat mina RATT
			var key = "board." + x + "_" + y + ".checked";
			var action = {};
			action[key] = 2;
 			Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":1}})
			Game.update({hostName: _hostName},{$set: action})
			}else{
				Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":-1}})
			}
 			//Om fail
		},
		updateBoard : function(_hostName, coordinates, queryObject){
			var revealsize= + Object.size(queryObject);
			var key = "board." + coordinates.x + "_" + coordinates.y + ".isMine";
			var action = {};
			action[key]

			var find = Game.find({hostName: _hostName}).fetch()
			var isMine =find[0].board[coordinates.x+'_'+coordinates.y].isMine;
			if(isMine ==1){
				Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.score":-1}})
			}
			Meteor.users.update({_id:Meteor.user()._id}, {$inc:{"profile.revealed":revealsize}})
			Game.update({hostName: _hostName},{$set: queryObject})

		},
		clearBoard: function(_hostName){
			Game.remove({hostName: _hostName});
		},
		removePoints: function(){
			Meteor.users.update({}, {$set:{"profile.score":0}}, {multi: true})
			Meteor.users.update({}, {$set:{"profile.revealed":0}}, {multi: true})

		}
		,
		consoleLog: function(message){
			console.log(message)
		} 
	});


	Meteor.startup(function () {

	});


