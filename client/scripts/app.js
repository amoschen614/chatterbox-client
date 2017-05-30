var app = {
  server: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
  username: 'mackaby',
  roomname: 'lobby',
  messages: [],
  lastMessageId: 0,
  friends: {},

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
    // even though no elements of class 'username' exist upon init
    // can rely on propagation to catch and handle events triggered 
    // by the child nodes that will eventually be created 
    app.$chats.on('click', '.username', app.handleUsernameClick);
    // fetch previous messages
    app.startSpinner();
    app.fetch();
    // poll for new messages every 3 seconds
    setInterval(function() {
      app.fetch();
    }, 3000);
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
    messages.filter(function(message) {
      if (app.roomname === 'lobby' && !message.roomname) {
        return true; // okay to display any message without specified room in lobby
      } else if (message.roomname === app.roomname) {
        return true; // okay to display message if current room is room specified by message
      } else return false;
    }).forEach(app.renderMessage); // render each individual message
    app.stopSpinner();
  },

  clearMessages: function() {
    app.$chats.html(''); // erases existing inner HTML content 
  },

  renderMessage: function(message) {
    // create a div to hold the message
    let $chat = $('<div class="chat"/>');
    // add in the message data
    let $username = $('<span class="username">/>');
    $username
      .text(message.username + ': ')
      .attr('data-username', message.username)
      .appendTo($chat);
    if (app.friends[message.username] === true) {
      $username.addClass('friend'); // add class to HTML element for CSS styling as friend
    }
    let $message = $('<br><span/>');
    $message.text(message.text).appendTo($chat);
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
    app.startSpinner();
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
    const selectIndex = app.$roomSelect.prop('selectedIndex'); // built-in 
    if (selectIndex === 0) { // first option -- create new room -- selected
      // create a new room
      const roomname = prompt('Enter room name');
      if (roomname) {
        app.roomname = roomname; // set current room to newly created room
        app.renderRoom(roomname); // add name of new room to dropdown menu of rooms
        app.$roomSelect.val(roomname); // set dropdown menu to display name of new room
      } 
    } else {
      // change to another existing room
      app.roomname = app.$roomSelect.val();
    }
    app.renderMessages(app.messages);
  },

  handleUsernameClick: function(event) {
    const username = $(event.target).data('username');
    if (username !== undefined) {
      app.friends[username] = !app.friends[username];
    }
    const selector = '[data-username="' + username.replace(/"/g, '\\\"' + '"]');
    const $usernames = $(selector).toggleClass('friend');
    // console.log('inside handleUsernameClick');
    // console.dir(event);
    // const username = event.target.innerText; // finds the DOM element that generated event
    // const slicedName = username.slice(0, -2); // remove trailing ': '  characters 
    // if (username !== undefined) {
    //   app.friends[slicedName] = !app.friends[slicedName]; // toggle friendship
    //   $('.username').each(function() {
    //   if (this.innerText === username) {
    //     $(this).toggleClass('friend');
    //   }
    // });
    // }
  },

  startSpinner: function() {
    $('.spinner img').show();
    $('form input[type=submit]').attr('disabled', true);
  },

  stopSpinner: function() {
    $('.spinner img').fadeOut('fast');
    $('form input[type="submit"]').attr('disabled', null);
  },

  escapeHTML: function(string) { // can substitute with jQuery .text method
    if (!string) { return; } 
    return string.replace(/[&<>"'=\/]/g, '');
  }

};