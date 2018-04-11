import React, { Component } from "react";
import { render } from "react-dom";
const { desktopCapturer } = require("electron");
const { takeScreenshot } = require("../../src/screencapture");

import Eyedropper from "../../src";
class Demo extends Component {
  constructor() {

    super();
    this.state = {
      img: ""
    };
    this.attach = this.attach.bind(this);
  }

  attach() {
    Eyedropper.pick().then(r => console.log(r, "resp"))
  }

  render() {
    console.log("inside main render")
    return (
      <div style={{flex: 1}}>
        <img src={this.state.img} />
        <h1>color-eye-dropper Demo</h1>
        <button type="button" onClick={this.attach}>
          Pick Color
        </button>
        <div style = {{margin: '10px'}}>
          <div id="rgb-color-box" style={{border: "solid 1px", padding: "15px", display: "none"}}>
          </div>
          <p id="rgb-values"></p>
        </div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector("#demo"));
