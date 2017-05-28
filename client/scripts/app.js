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
    // add listeners
    app.$send.on('submit', app.handleSubmit);
    // fetch previous messages
    app.fetch();
    // poll for new messages every 3 seconds
    // setInterval(function() {
    //   app.fetch();
    // }, 3000);
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
          app.renderMessages(app.messages);
        }
      },
      error: function(error) {
        console.error(error);
      }
    });
  },

  renderMessages: function(messages) {
    app.clearMessages(); // clear old messages
    messages.forEach(app.renderMessage); // render each individual message
  },

  clearMessages: function() {
    app.$chats.html(''); // erases existing inner HTML content 
  },

  renderMessage: function(message) {
    // create a div to hold the message
    let $chat = $('<div class="chat"/>')
    // add in the message data
    let $username = $('<span class="username">' + message.text + '</span>');
    $username.appendTo($chat);
    let $message = $('<br><span>' + message.text + '</span>');
    $message.appendTo($chat);
    // add the message to the UI
    app.$chats.append($chat);
  },

  handleSubmit: function() {
    console.log('handleSubmit called');
    event.preventDefault(); // default browser action refreshes page on events
    
  }

}