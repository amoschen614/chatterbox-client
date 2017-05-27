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
        console.dir(data);
        // TODO:
        // don't do anything if we have nothing to work with

        // store messages for caching later

        // only update the DOM if we have a new message
          // render each individual message
            // create a div to hold the message
            // add in the message data
            // add the message to the UI 
      },
      error: function(error) {
        console.error(error);
      }
    });
  }

}