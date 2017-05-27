var app = {
  server: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
  username: 'mackaby',
  roomname: 'lobby',

  init: function() {
    // get username
    app.username = window.location.search.substr(10); 
    // cache jQuery selectors
    app.$message = $('#message');
    app.$chats = $('#chats');
    app.$roomSelect = $('#roomSelect');
    app.$send = $('#send');
  },

  fetch: function() {
    $.ajax({
      url: app.server,
      type: 'GET',
      success: function(data) {
        console.log('ajax request succeeded');
      },
      error: function(error) {
        console.error(error);
      }
    });
  }

}