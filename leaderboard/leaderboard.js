// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

var magic = new Deps.Dependency;
Players = new Meteor.Collection("players");

if (Meteor.isClient) {

  var theOnesWeWant = Players.find({}, {
      sort: {score: 1, name: 1}
  });

  Template.leaderboard.players = function () {
    Deps.depend(magic);
    return theOnesWeWant;
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.leaderboard.checkSession = function() {
    var sortBy = Session.get('');
  }

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click input.sortByScore': function () {
      Session.set('sortBy', 'score');
      theOnesWeWant = Players.find({}, {
        sort: {score: 1, name: 1}
      });
      magic.changed();
    },
    'click input.sortByName': function () {
      Session.set('sortBy', 'name'); // reset scores
      theOnesWeWant = Players.find({}, {
        sort: { name: 1, score: 1 }
      })
      magic.changed();
    },
    'click input.resetScores': function () {
      // Players.update(Session.get("selected_player")); // drop player from the list
      
      // theOnesWeWant = Players.find({}, {
      //   sort: {score: 1, name: 1}
      // });
      // theOnesWeWant.forEach(function(player) {
        
      //   console.log(player);
      // });
      //Players.update({}, {$set: {score: 5}});
      Players.update( {}, {$set: {score: 0 }});

      magic.changed();
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Players.remove({});
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Seung Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Anthony Friedrich Gauss",
                   "Rual Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
