import React from "bower_components/react/react";
import Reflux from "bower_components/reflux/dist/reflux";
import SocketStore from "./stores/SocketStore";
import Actions from "./Actions";

export default React.createClass({
  mixins: [Reflux.connect(SocketStore, "lobby")],
  getInitialState: function(){
    var name = "no name";
    var url = window.location.href;
    var name = url.split('?')[1].split('=')[1];
    console.log("url",url);
    //Actions.join("lobby",name);
    return({
      name: name,
      text: "",
      messages: [{from: "Local System",text: "Welcome: "+name}]
    })
  },
  onClick: function(event){
    console.log("state",this.state,this.state.chan);
    
    var chan = this.state.lobby.chan
    if(chan){
	var msg = {from: this.state.name,text: this.state.text}
    	console.log("chan",chan,"sending", msg)

	// send the message
    	var res = chan.push("msg",msg);
    	this.setState({text: ""})
    }
    
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
  componentWillMount(){
    console.log("trying to call Actions.join",this)
    Actions.join("lobby",this.state.name);
  },
  render() {

    // look for new messages in state

    if (this.state.lobby && this.state.lobby.in_msg){
      var msg = this.state.lobby.in_msg
      this.state.messages.push(msg)
      this.state.lobby.in_msg = null;
    }else{
      console.log("non msg update call of render");
    }
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
