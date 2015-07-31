# How to tutorial wiring up a Phoenix Channels, and Reflux chat app
##Part 4: Phoenix + Reflux


* [Understanding Sockets](#sockets)
* [Adding the reflux, react basics](#react-reflux-basics)
* [React grunt work](#react-grunt-work)

### Sockets 

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

  //  This just passes the object from init() which is called by reflux
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
### React Reflux Basics
Using this as a starting point my next [commit](https://github.com/jschoch/phorechat/commit/c73267fcecb8b6ce4f0d43f649ad07026e614db9) updates the router, adds Actions.js, ChattApp.js, a modified SocketStore.js, and the templat index.html.eex. I should have put priv/static into my .gitignore, so please ignore it unless you want to see how brunch has aggregated the assets.

> web/router.js

Here we add the socket directive for our router which sends all websocket connections to our [ChatChannel](https://github.com/jschoch/phorechat/blob/master/web/channels/chat_channel.ex) controller

```diff
     get "/newuser",IndexController, :newuser
   end
 
+  socket "/chat/ws", Chat, via: [Phoenix.Transports.WebSocket] do
+    channel "chat", ChatChannel
+  end
+
   
 end
 ```

> web/static/js/Actions.js

This is pretty straightforward, we just bind 2 actions to our store.  joined isn't actually used and just was pulled over from gaze.

```diff 
+import Reflux from "bower_components/reflux/dist/reflux";
+
+export default Reflux.createActions([
+  "join",
+  "joined"
+]);
```
>web/static/js/ChatApp.js

ChatApp sets up react, and ensures it is working.  Mixins per the reflux docs:

>Methods from mixins are available as well as the methods declared in the Store. So it's possible to access store's this from >mixin, or methods of mixin from methods of store.

>A nice feature of mixins is that if a store is using multiple mixins and several mixins define the same lifecycle method >(e.g. init, preEmit, shouldEmit), all of the lifecycle methods are guaranteed to be called.

```js
import React from "bower_components/react/react";
import Reflux from "bower_components/reflux/dist/reflux";
import SocketStore from "./stores/SocketStore";

export default React.createClass({
  // this initializes our SocketStore 
  mixins: [Reflux.connect(SocketStore, "socket")],

  render() {

    return(
      <div> react works? </div>
    )
  }
});
```
> web/templates/index/index.html.eex

Our index template simply provides a div to land our React rendered code into, simplified below

```html
<div id="chat"></div>
```

> web/static/js/app.js

Finally app.js pulls in our ChatApp and renders via React

```js
import React from "bower_components/react/react";
import ChatApp from "./ChatApp";

React.render(
  <ChatApp />,
  document.getElementById("chat")
);
```

checking the results should look something like this:

![phoenix rendered page and phoenix server output from iex](http://brng.us/images/react.png)

### React Grunt Work

We need to start to plumb up all of our React goodness.  Our [ChatApp.js](https://github.com/jschoch/phorechat/blob/f07a98f2a99ed5b2d69855bc9fe492a6124404a5/web/static/js/ChatApp.js) commit is commented below

```js
import React from "bower_components/react/react";
import Reflux from "bower_components/reflux/dist/reflux";
import SocketStore from "./stores/SocketStore";
import Actions from "./Actions";

export default React.createClass({
  mixins: [Reflux.connect(SocketStore, "socket")],
  
  //
  //  getInitialState sets up our state for React
  //

  getInitialState: function(){
    var name = "no name";
    
    // 
    // I should be using a router, but this quick hack for pulling in the username works
    //
    
    var url = window.location.href;
    var name = url.split('?')[1].split('=')[1];
    console.log("url",url);
    
    //
    // This 'Actions.join' is what causes the phoenix socket to join the channel and to be connected to our state.
    //
    
    Actions.join("foo"); 
    return({
      name: name,
      text: "",
      messages: [{from: "Local System",text: "Welcome: "+name}]
    })
  },
  render() {

    return(
      <div> 
	<h2>PhoReChat</h2>
        <button className="btn btn-xs">{this.state.name}</button>
        
        Enter Message: <input type="text" onChange={this.handleMsgChange} value={this.state.text} onKeyDown={this.submitMsg}></input>
        <button className="btn btn-xs" onClick={this.onClick}>Send!</button>
        <hr/>
        Messages:
        <button className="btn btn-xs" onClick={this.clearMsgs}>Clear msgs</button>
        <ul>
          <Msgs msgs={this.state.messages} /> 
        </ul>
      </div>
    )
  }
});

// 
//  This renders all messages in this.state.messages which are pushed in from reflux via the phoenix socket's 
//    accepting a properly formatted message
//

var Msgs = React.createClass({
  render: function(){
    return(
      <div>
      {this.props.msgs.map(function(msg){
        return ( 
          <li>
          <span>
          <span className="badge"> {msg.from } </span>: {msg.text}
          </span>
          </li>
        )
      })}
      </div>
    )
  }
})
```

Now I add the handlers for clicks and input

# TODO: need to refactor this quite a bit

```javascript
   },
   
 //
 //  onClick triggered by clicking submit
 //
   
+  onClick: function(event){
+    console.log("state",this.state,this.state.chan);
//
//   Get our channel object from the state
//
+    var chan = this.state.socket.foo_chan
+    console.log("chan",chan)
//
//   Push the text from the text input to the server
//
+    var res = chan.push("msg",{from: this.state.name,text: this.state.text})
//
//   Clear the text input
//
+    this.setState({text: ""})
+    
+  },
+  handleMsgChange: function(event){
+    this.setState({text: event.target.value})
+  },
+  handleNameChange: function(event){
+    this.setState({name: event.target.value})
+  },
//
// this removes the messages to reduce scroll, would be better to push them into an archive object so they 
// don't just get deleted
//
+  clearMsgs: function(){
+    this.setState({messages: []});
+  },
//
// this would allow you to change the username, though it is not used
//
+  setName: function(name){
+    this.setState({name: name})
+  },
/  this listens for the enter key to be pressed when focus is on the text input
+  submitMsg: function(event){
+    if(event.keyCode == 13){
+      this.onClick(event)
+    }
+  },
//
// also not used, but would allow you to set the name via a text input
//
+  submitName: function(name){
+    this.setState({name: name})
+  },
+
   render() {
```
