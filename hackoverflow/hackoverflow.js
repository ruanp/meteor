Users = new Meteor.Collection('users');
          //name, questions[],answers[]
Questions = new Meteor.Collection('questions');
          // answers[],user,text
Answers = new Meteor.Collection('answers');
          // answerer,question,text

refreshTimer = new Deps.Dependency;

if (Meteor.isClient) {
  Template.forum.loggedIn = function () {
    return (Session.get('currentUserId') && Users.findOne({'_id':Session.get('currentUserId')}).name);
  };

  Template.login.greeting = function () {
    return "Hi there. Welcome to HackOverflow.";
  };

  Template.askQuestion.currentUserName = function () {
    return Users.findOne({'_id':Session.get('currentUserId')}).name;
  };

  Template.content.created = function() {
    this.refreshInterval = Meteor.setInterval(function() {
      refreshTimer.changed();
    }, 60000);
  };

  Template.content.destroyed = function() {
    console.log('Content area destroyed. Clearing timer.');
    Meteor.clearInterval(this.refreshInterval);
  }

  Template.question.helpers({
    asker: function() {
      return Users.findOne({'_id': this.askerId}).name;
    },
    timeAgo: function() {
      return moment(this.dateTime).fromNow();
    }
  });

  Template.content.questions = function () {
    refreshTimer.depend();
    return Questions.find({});
  };

  Template.askQuestion.events({
    'click input.askButton' : function () {
      Questions.insert({
        askerId : Session.get('currentUserId'),
        text : $('input.question').val(),
        answerIds : [],
        dateTime : new Date().toISOString(),
       });
    },
    'click input.logoutButton' : function () {
      console.log('logging out!');
      Session.set('currentUserId', undefined);
    }
  });
  Template.login.events({
    'click input.loginButton': function () {
      // template data, if any, is available in 'this'
      var username = $('.username').val();
      var recordCursor = Users.find({ name : username });
      var userId = (recordCursor.count() === 0) ? Users.insert({name : username}) 
                                                : recordCursor.fetch()[0]._id;
      Session.set('currentUserId',userId);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

// var Session = {
//   storage: {
//     currentUserId: "Gmav3WtCfcRryoGKu"
//   }
//   get: function(name) {
//     return this.storage['currentUser'];
//   }
//   set: function(name, thing) {
//     this.storage[name] = thing;
//   }
// }