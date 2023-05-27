$(function() {
    $('#chat-form').submit(function(event) {
      event.preventDefault();
  
      const message = $('#chat-input').val();
      $('#chat-input').val('');
      myChatbot.sendMessage(message);
  
      // Retrieve the updated chat log
      $.ajax({
        url: '/chatlog',
        method: 'GET',
        success: function(response) {
          const chatlog = response.chatlog;
  
          let log = '';
          for (let i = 0; i < chatlog.length; i++) {
            const messageClass = chatlog[i].isUser ? 'user-msg' : 'bot-msg';
            log += '<div class="' + messageClass + '">' + chatlog[i].content + '</div>';
          }
  
          $('.chat-log').html(log);
          $('.chat-log').scrollTop($('.chat-log')[0].scrollHeight); // auto scroll to bottom
          $('#chat-input').focus(); // focus on input after sending message
        },
        error: function() {
          console.log('Failed to retrieve chat log.');
        }
      });
    });
  
    $('#chat-input').focus(); // focus on input on page load
  });
  