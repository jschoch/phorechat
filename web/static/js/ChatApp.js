import React from "bower_components/react/react";
import Reflux from "bower_components/reflux/dist/reflux";
import SocketStore from "./stores/SocketStore";
import Actions from "./Actions";

export default React.createClass({
  mixins: [Reflux.connect(SocketStore, "socket")],
  getInitialState: function(){
    var name = "no name";
    var url = window.location.href;
    var name = url.split('?')[1].split('=')[1];
    console.log("url",url);
    Actions.join("foo"); 
    return({
      name: name,
      text: "",
      messages: [{from: "Local System",text: "Welcome: "+name}]
    })
  },
  onClick: function(event){
    console.log("state",this.state,this.state.chan);
    //var chan = this.state.socket._socket.chan("foo",{name: this.state.name})
    var chan = this.state.socket.foo_chan
    console.log("chan",chan)
    var res = chan.push("msg",{from: this.state.name,text: this.state.text})
    this.setState({text: ""})
    
  },
  handleMsgChange: function(event){
    this.setState({text: event.target.value})
  },
  handleNameChange: function(event){
    this.setState({name: event.target.value})
  },
  clearMsgs: function(){
    this.setState({messages: []});
  },
  setName: function(name){
    this.setState({name: name})
  },
  submitMsg: function(event){
    if(event.keyCode == 13){
      this.onClick(event)
    }
  },
  submitName: function(name){
    this.setState({name: name})
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
