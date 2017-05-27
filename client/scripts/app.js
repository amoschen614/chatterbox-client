var app = {
  server: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
  username: 'mackaby',
  roomname: 'lobby',
  messages: [],
  lastMessageId: 0,

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
        if (!data.results || !data.results.length) { return; }
        // store messages for caching later
        app.messages = data.results;
        const mostRecentMessage = app.messages[app.messages.length-1];
        // only update the DOM if we have a new message
        if (mostRecentMessage.objectId !== app.lastMessageId) {
          app.$chats.html(''); // erases existing HTML content
          // render each individual message
          for (let i = 0; i < app.messages.length; i++) {
            // create a div to hold the message
            let $chat = $('<div class="chat"/>')
            // add in the message data
            let $username = $('<span class="username">' + app.messages[i].text + '</span>');
            $username.appendTo($chat);
            let $message = $('<br><span>' + app.messages[i].text + '</span>');
            $message.appendTo($chat);
            // add the message to the UI
            app.$chats.append($chat);
          }
        }
      },
      error: function(error) {
        console.error(error);
      }
    });
  }

}