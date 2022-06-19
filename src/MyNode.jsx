import React from "react";
import { Node, Socket, Control } from "rete-react-render-plugin";

export class ProxyNode extends Node {
  renderInputs = () => {
    const { node, bindSocket, bindControl } = this.props;
    const { outputs, controls, inputs, selected } = this.state;
    let elems = [];
    for (var input_key in inputs) {
      // console.log(inputs[input_key]);
      var input = inputs[input_key];
      var output = outputs.find(n => n.key === input.key);

      elems.push(
        <div className="content" key={"content_" + input.key}>
          <div className="input column">
            {/* Controls */}
            {controls.map(control => (
              <Control
                className="control"
                key={control.key}
                control={control}
                innerRef={bindControl}
              />
            ))}

            <div className="input" key={"in_" + input.key}>
              <Socket
                type="input"
                socket={input.socket}
                io={input}
                innerRef={bindSocket}
              />
              {!input.showControl() && (
                <div className="input-title">
                  {node.data[input.key]} {input.name}
                  {/* {input.key} */}
                </div>
              )}
              {input.showControl() && (
                <Control
                  className="input-control"
                  control={input.control}
                  innerRef={bindControl}
                />
              )}
            </div>
          </div>
          {output && (
            <div className="output column">
              <div key={"out_" + output.key}>
                <div className="output-title">
                  {output.name}
                  {/* {node.data[output.key]} */}
                </div>
                <Socket
                  type="output"
                  socket={output.socket}
                  io={output}
                  innerRef={bindSocket}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
    return elems;
  };

  render() {
    const { node, bindSocket, bindControl } = this.props;
    const { outputs, controls, inputs, selected } = this.state;

    return (
      <div className={`node ${selected}`} style={{ background: "grey" }}>
        <div className="title">
          {"<<"} {node.name} - {node.label} {">>"}
        </div>
        <div className="title">
          {"<<"} {node.group} {">>"}
        </div>
        <div className="content">{this.renderInputs()}</div>
      </div>
    );
  }
}

export class MyNode extends Node {
  render() {
    const { node, bindSocket, bindControl } = this.props;
    const { outputs, controls, inputs, selected } = this.state;

    return (
      <div className={`node ${selected}`} style={{ background: "grey" }}>
        <div className="title">
          {"<<"} {node.name} {">>"}
        </div>
        <div className="content">
          <div className="input column">
            {/* Controls */}
            {controls.map(control => (
              <Control
                className="control"
                key={control.key}
                control={control}
                innerRef={bindControl}
              />
            ))}
            {/* Inputs */}
            {inputs.map(input => (
              <div className="input" key={input.key}>
                <Socket
                  type="input"
                  socket={input.socket}
                  io={input}
                  innerRef={bindSocket}
                />
                {!input.showControl() && (
                  <div className="input-title">
                    {node.data[input.key]} {input.name} {input.key}
                  </div>
                )}
                {input.showControl() && (
                  <Control
                    className="input-control"
                    control={input.control}
                    innerRef={bindControl}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Outputs */}
          <div className="output column">
            {outputs.map(output => (
              <div className="output" key={output.key}>
                <div className="output-title">{node.data[output.key]}</div>
                <Socket
                  type="output"
                  socket={output.socket}
                  io={output}
                  innerRef={bindSocket}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
