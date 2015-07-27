import React from "bower_components/react/react";
import Reflux from "bower_components/reflux/dist/reflux";
import SocketStore from "./stores/SocketStore";

export default React.createClass({
  mixins: [Reflux.connect(SocketStore, "socket")],

  render() {

    return(
      <div> react works? </div>
    )
  }
});
