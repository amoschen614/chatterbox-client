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
    app.$roomSelect.on('change', app.handleRoomChange);
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
      data: { order: '-createdAt' },
      success: function(data) {
        console.dir(data);
        // TODO:
        // don't do anything if we have nothing to work with
        if (!data.results || !data.results.length) { return; }
        // store messages for caching later
        app.messages = data.results;
        const mostRecentMessage = app.messages[app.messages.length - 1];
        // only update the DOM if we have a new message
        if (mostRecentMessage.objectId !== app.lastMessageId) {
          app.renderRoomList(app.messages);
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
    let $chat = $('<div class="chat"/>');
    // add in the message data
    let $username = $('<span class="username">/>');
    $username.text(message.username + ': ').appendTo($chat);
    let $message = $('<br><span/>');
    $message.text(message).appendTo($chat);
    // add the message to the UI
    app.$chats.append($chat);
  },

  handleSubmit: function(event) {
    // server expects JSON, so initialize content to stringify
    const message = {
      username: app.username,
      text: app.$message.val(),
      roomname: app.roomname || 'lobby'
    };
    // send a message to the server
    app.send(message);
    event.preventDefault(); // default browser action refreshes page on events

  },

  send: function(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/JSON',
      success: function() {
        app.$message.val(''); // feedback for message submission
        // trigger a fetch to update the messages if successful
        app.fetch();
      },
      error: function(error) {
        // show an error in the console if failed
        console.error('chatterbox: failed to send message', error);
      }
    });  
  },

  renderRoomList: function(messages) { // render rooms in response to message data
    // provide option to create new room as first option in dropdown menu
    app.$roomSelect.html('<option value="__newRoom">New room...</option></select>');
    if (messages) {
      let hasRoom = {};
      // iterate through each message fetched and check roomname property
      messages.forEach(function(message) {
        const roomname = message.roomname;
        // if message has roomname, add roomname as an option in room selection menu
        if (roomname && !hasRoom[roomname]) {
          app.renderRoom(roomname);
          hasRoom[roomname] = true; // only add a roomname to menu once
        }
      });
    }
    app.$roomSelect.val(app.roomname); //show current room as selected in menu
  },

  renderRoom: function(roomname) {
    // accept a roomname, create option element, and append to menu 
    const $option = $('<option/>').val(roomname).text(roomname);
    // prevent cross-site scripting by escaping with DOM methods
    app.$roomSelect.append($option);
  },

  handleRoomChange: function(event) {
    console.log('inside handleRoomChange');
  },

  escapeHTML: function(string) { // can substitute with jQuery .text method
    if (!string) { return; } 
    return string.replace(/[&<>"'=\/]/g, '');
  }

};