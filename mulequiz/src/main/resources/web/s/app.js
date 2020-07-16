/* jshint esversion: 6 */
var gameId = window.location.pathname.split('/').pop();
var wsURL = 'wss://' + window.location.hostname + ':443' + window.location.pathname;
var ws = new WebSocket(wsURL);
var app = new Vue({
  el: '#app',
  data: {
    status: '',
    players: [],
    mainMessage: '',
    timeLeft: '',
    messages: [],
    newmsg: '',
    sid: Cookies.get('sid'),
    nickname: Cookies.get('nickname')
  },

  // Vue Methods hook
  methods: {
    // Send a chat message
    send(){
      var msg = {
        type: "chat",
        data: {
          from: {
            sid: this.sid,
            nickname: this.nickname,
          },
          text: this.newmsg
        }
      };
      ws.send(JSON.stringify(msg));
      this.newmsg = null;
    },
    // Save the nickname in cookies and send it to game master
    saveNickname(){
      Cookies.set('nickname', this.nickname, { expires: 30 });
      var msg = {
        type: "action",
        data: {
          action: "playerInfo",
          sid: this.sid,
          nickname: this.nickname
        }
      };
      ws.send(JSON.stringify(msg));
    },
    getNickname: function (p) {
      return this.players.find(e => e.sid == p.sid).nickname;
    },
    startGame(){
      var msg = {
        type: "action",
        data: {
          action: "start"
        }
      };
      ws.send(JSON.stringify(msg));
    }
  },
  created(){
    // Set Cookies
    if(!Cookies.get('sid')){
      this.sid = Math.random().toString(36).substr(2, 5);
      Cookies.set('sid', this.sid, { expires: 1 });
    }
    if(!Cookies.get('nickname'))
    {
      this.nickname = 'Player-'+this.sid;
      Cookies.set('nickname', this.nickname, { expires: 30 });
    }
    
    // Listen to the websocket
    ws.onmessage = ({ data }) => {
      var msg = JSON.parse(data);
      if(msg.type == 'chat')
        this.messages.push(msg.data);
      if(msg.type == 'status') {
        this.players = msg.data.players;
        this.mainMessage = msg.data.mainMessage;
        this.timeLeft = msg.data.timeLeft;
      }
    };

    // Send a first action (playerinfo) when connection is established
    ws.onopen = () => this.saveNickname();
  },
  watch: {
    messages: function() {
      this.$nextTick(function() {
        var container = this.$refs.messages;
        container.scrollTop = container.scrollHeight;
      });
    }
  }
});