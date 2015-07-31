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
import {Socket} from "phoenix";
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

At this point you should see this error in your browser's console:
> Uncaught TypeError: Cannot read property 'push' of undefined

We need to dig into the reflux store and add the username to join, and add the route for the channel

> web/channels/chat_channel.ex

```elixir
defmodule Phorechat.ChatChannel do
+  require Logger
   use Phorechat.Web, :channel
 
   def join("chat:lobby", payload, socket) do
+    Logger.info "Join attempt: #{inspect payload}"
     if authorized?(payload) do
       {:ok, socket}
     else
```

> web/router.ex

```elixir
     get "/newuser",IndexController, :newuser
   end
 
-  socket "/chat/ws", Chat, via: [Phoenix.Transports.WebSocket] do
-    channel "chat", ChatChannel
+  socket "/chat/ws", Phorechat, via: [Phoenix.Transports.WebSocket] do
+    channel "lobby", ChatChannel
   end
 
   # Other scopes may use custom stacks.
```

> web/static/js/stores/SocketStore.js

```javascript
     console.log("url",url);
-    Actions.join("foo"); 
+    Actions.join("lobby",name); 
     return({
```

> web/static/js/stores/SocketStore.js

I added some debugging hooks and the trigger which pushes the message to react

```javascript
onJoin(channelName,username) {
+    // called from Actions.join(channelName,username)
+    // callback generated from Actions.js
+
+    // this makes the request to join a channel
     var chan = this._socket.chan(channelName, {username: username});
+    chan.onError( () => console.log("there was an error!") )
+    chan.onClose( () => console.log("the channel has gone away gracefully") )
+    // store the channel in the state as this.lobby
 
-    chan.join().receive("ok", () => {
-      Actions.joined(channelName, chan);
+    console.log("onJoin called for username: ",username,"channelName",channelName,"chan",chan);
+
+    chan.on("msg", data => {
+      console.log("saw msg",this,"data",data);
//
//  This is what pushes the message to the React state
//
+      this.trigger({in_msg: data,chan: chan});
     });
-  },
 

+    chan.join().receive("ok", ({msg}) => {
+      // triggered when the server responds with an "ok" message
+      console.log("channel post join:",msg,chan);
+      })
+      .after(1000, () => console.log("Networking issue. Still waiting...",this) )
+      .receive("error",({reason}) => console.log("failed to join",reason));
+  },
   onSocketOpen() {
```

> ChatApp.js

I moved Actions.join to componentWillMount since we need to wait for the mixin's init to be called and call Socket.connect.

I also add a check for new msgs in state.lobby.in_msg, if there is a new message it pushes it to messages to be rendered.

```javascript
onClick: function(event){
     console.log("state",this.state,this.state.chan);
-    //var chan = this.state.socket._socket.chan("foo",{name: this.state.name})
-    var chan = this.state.socket.foo_chan
-    console.log("chan",chan)
-    var res = chan.push("msg",{from: this.state.name,text: this.state.text})
-    this.setState({text: ""})
+    
+    var chan = this.state.lobby.chan
+    if(chan){
+	var msg = {from: this.state.name,text: this.state.text}
+    	console.log("chan",chan,"sending", msg)
+
+	// send the message
+    	var res = chan.push("msg",msg);
+    	this.setState({text: ""})
+    }
     
   },
   handleMsgChange: function(event){
 @@ -46,9 +51,21 @@ export default React.createClass({
   submitName: function(name){
     this.setState({name: name})
   },
-
+  componentWillMount(){
+    console.log("trying to call Actions.join",this)
+    Actions.join("lobby",this.state.name);
+  },
   render() {
 
+    // look for new messages in state
+
+    if (this.state.lobby && this.state.lobby.in_msg){
+      var msg = this.state.lobby.in_msg
+      this.state.messages.push(msg)
+      this.state.lobby.in_msg = null;
+    }else{
+      console.log("non msg update call of render");
+    }
     return(
```

A quick update to out channel controller adds a join message and a catchall if the join doens't go to the right place *has an unknown channel name *

```elixir
defmodule Phorechat.ChatChannel do
   require Logger
-  use Phorechat.Web, :channel
 
-  def join("chat:lobby", payload, socket) do
-    Logger.info "Join attempt: #{inspect payload}"
+  # TODO: why does this break everything?
+  # this line messed up all kinds of stuff, need to figure out why!!!!!!!!!
+  #use Phorechat.Web, :channel
+  use Phoenix.Channel
+
+  def join("lobby", payload, socket) do
     if authorized?(payload) do
+      # announce who joined
+      Logger.info "Join authorized: #{inspect payload}"
+      send self, {:joined,payload}
       {:ok, socket}
     else
       {:error, %{reason: "unauthorized"}}
     end
   end
+  
+  # catchall for debugging
+  def join(topic,payload,socket) do
+    Logger.error("unknown topic: " <> inspect topic <> " \npayload: " <> inspect payload)
+  end
 
   # Channels can be used in a request/response fashion
   # by sending replies to requests from the client
+  def handle_info({:joined,payload},socket) do
+    Logger.info "received join"
+    broadcast!(socket,"msg",%{from: "system",text: "user joined: #{payload["username"]}"})
+    {:noreply,socket}
+  end
   def handle_in("ping", payload, socket) do
     {:reply, {:ok, payload}, socket}
   end
 @@ -23,17 +39,37 @@ defmodule Phorechat.ChatChannel do
     broadcast socket, "shout", payload
     {:noreply, socket}
   end
+  def handle_in("phx_join",map,socket) do
+    Logger.info("phx_join socket \nmap: #{inspect map}\nsocket: #{inspect socket}")
+    {:noreply, socket}
+  end
 
   # This is invoked every time a notification is being broadcast
   # to the client. The default implementation is just to push it
   # downstream but one could filter or change the event.
   def handle_out(event, payload, socket) do
+    Logger.info("msg being sent out: event #{inspect event}, payload #{inspect payload}")
     push socket, event, payload
     {:noreply, socket}
   end
 
   # Add authorization logic here as required.
   defp authorized?(_payload) do
+    Logger.info("Auth called, returning true always, need to fix this")
     true
   end
+
+
+  def handle_in("msg",payload,socket) do
+    Logger.info("Msg!\n#{inspect payload}")
+    broadcast!(socket,"msg",payload)
+    {:noreply,socket}
+  end
+  
+  # this is a catch all to log any msg attempt
+
+  def handle_in(msg,payload,socket) do
+    Logger.error("unknown msg!" <> inspect msg <> "\n" <> inspect payload) 
+    {:noreply,socket}
+  end
 end
```
