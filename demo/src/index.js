import React, { Component } from "react";
import { render } from "react-dom";
const { desktopCapturer } = require("electron");
const { takeScreenshot } = require("../../src/screencapture");

import Example from "../../src";

class Demo extends Component {
  constructor() {
    super();
    this.state = {
      img: ""
    };
    this.attach = this.attach.bind(this);
  }

  attach() {
    Example.say();
  }

  render() {
    return (
      <div>
        <img src={this.state.img} />
        <h1>color-eye-dropper Demo</h1>
        <button type="button" onClick={this.attach}>
          fdsf
        </button>
      </div>
    );
  }
}

render(<Demo />, document.querySelector("#demo"));
