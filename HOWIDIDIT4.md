# How to tutorial wiring up a Phoenix Channels, and Reflux chat app
##Part 4: Phoenix + Reflux

I started this with hacking chat into [gaze](https://github.com/ericmj/gaze) which displays some system information from your erlang vm.

The [SocketStore.js](https://github.com/ericmj/gaze/blob/master/web/static/js/stores/SocketStore.js) has all the goodies for getting a phoenix channel updating a reflux store.

Let's disect it a bit 

```js
// This first import for "phoenix" had me flummoxed until I worked with phoenix creator Chris McCrord.  
//  The brunch config i use is discussed in part 3 does all the magic in our version which is a bit 
//  different from what ericmj did here.
import {Socket} from "../../vendor/phoenix";
import Reflux from "bower_components/reflux/dist/reflux";
// Actions are discussed here  https://github.com/spoike/refluxjs#creating-actions
import Actions from "../Actions";

export default Reflux.createStore({
  // This binds the conventional callbacks onJoin and onJoined via Actions.js to our store.  These are 
  //  called via Action.join("channel name here") and Action.joined(
  listenables: Actions,

  // This sets up our this object
  init() {
    // I'm note exactly sure what this does, or why connectd is needed.  The channel has a status of 
    //  "closed" || "joining" || "joined"
    this.connected = false;
    // This maps to our phoenix router's socket directive, for phorechat it is here: https://github.com/jschoch/phorechat/blob/master/web/router.ex#L23-L25
    this._socket = new Socket("/gaze/ws");
    // This configures the socket, however it does not appear it triggers onSocketOpen until you use 
    //  chan.join()
    this._socket.connect();
    // this mapps the functions below in our reflux store to our phoenix events.
    this._socket.onOpen(this.onSocketOpen);
    this._socket.onClose(this.onSocketClose);
    this._socket.onError(this.onSocketClose);
  },

  // * not sure *  This just passes the object from init()
  getInitialState() {
    return this;
  },

  // our callback fired on Actions.join(...)
  onJoin(channelName) {
    // this configures the default params for join, the channel name in this case
    var chan = this._socket.chan(channelName, {});

    // this promise is triggered when the server sends down an "ok" msg
    chan.join().receive("ok", () => {
      // this is fired in ChannelMixin.js 
      Actions.joined(channelName, chan);
    });
  },

  onSocketOpen() {
    this.connected = true;
    // Trigger is simular to setState in React.  it updates the reflux store's object
    this.trigger(this);
  },

  onSocketClose() {
    this.connected = false;
    this.trigger(this);
  }
});
```


