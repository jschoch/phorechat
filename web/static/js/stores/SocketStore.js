import {Socket} from "phoenix";
import Reflux from "bower_components/reflux/dist/reflux";
import Actions from "../Actions";

export default Reflux.createStore({
  listenables: Actions,

  init() {

    console.log("SocketStore init()")
    this.connected = false;
    this._socket = new Phoenix.Socket("/chat/ws",{});

    // this connects us to the server
    // the phoenix.js lib will manage reconnections

    this._socket.connect();
    this._socket.onOpen(this.onSocketOpen);
    this._socket.onClose(this.onSocketClose);
    this._socket.onError(this.onSocketClose);
    this.lobby = null;
  },

  getInitialState() {
    return this;
  },

  onJoin(channelName,username) {
    // called from Actions.join(channelName,username)
    // callback generated from Actions.js

    // this makes the request to join a channel
    var chan = this._socket.chan(channelName, {username: username});
    chan.onError( () => console.log("there was an error!") )
    chan.onClose( () => console.log("the channel has gone away gracefully") )
    // store the channel in the state as this.lobby

    console.log("onJoin called for username: ",username,"channelName",channelName,"chan",chan);

    chan.on("msg", data => {
      console.log("saw msg",this,"data",data);
      this.trigger({in_msg: data,chan: chan});
    });

    //chan.join(channelName,{username: username}).receive("ok", (msg) => {
    //chan.join().receive("ok",(msg) => {
    //chan.join(channelName,{username: username}).receive(msg => {
    chan.join().receive("ok", ({msg}) => {
      // triggered when the server responds with an "ok" message
      console.log("channel post join:",msg,chan);
      })
      .after(1000, () => console.log("Networking issue. Still waiting...",this) )
      .receive("error",({reason}) => console.log("failed to join",reason));
  },
  onSocketOpen() {
    console.log("onSocketOpen called")
    this.connected = true;
    this.trigger(this);
  },

  onSocketClose() {
    console.log("error :(");
    this.connected = false;
    this.trigger(this);
  }
});
