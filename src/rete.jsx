import React from "react";
import Rete from "rete";
import ReactRenderPlugin from "rete-react-render-plugin";
import CommentPlugin from "rete-comment-plugin";
import ConnectionPlugin from "rete-connection-plugin";
import ContextMenuPlugin from "rete-context-menu-plugin";
import HistoryPlugin from "rete-history-plugin";
import AutoArrangePlugin from "rete-auto-arrange-plugin";
import ConnectionPathPlugin from "rete-connection-path-plugin";

import AreaPlugin from "rete-area-plugin";

import { MyNode, ProxyNode } from "./MyNode";

var numSocket = new Rete.Socket("Number value");
var textSocket = new Rete.Socket("Text");
var anyTypeSocket = new Rete.Socket("Any type");
anyTypeSocket.combineWith(numSocket);

numSocket.combineWith(anyTypeSocket);
numSocket.combineWith(textSocket);
textSocket.combineWith(anyTypeSocket);

class ProxyControl extends Rete.Input {
  //var inp1 = new Rete.Input("num1", "Number", numSocket);
  //inp1.addControl(new NumControl(this.editor, "num1", node));
  constructor(key, title, socket, multiConns, node, editor, control) {
    super(key, title, socket, multiConns);
    this.addControl(new control(editor, key, node));
    node.addOutput(new Rete.Output(key, title, socket));
    // node.data.proxies.push(key);
    node.addInput(this);
  }
}

class TextControl extends Rete.Control {
  static component = ({ value, onChange }) => (
    <input
      type="text"
      value={value}
      ref={ref => {
        ref && ref.addEventListener("pointerdown", e => e.stopPropagation());
      }}
      onChange={e => onChange(e.target.value)}
    />
  );

  constructor(emitter, key, node, readonly = false) {
    super(key);
    this.emitter = emitter;
    this.key = key;
    this.component = TextControl.component;

    const initial = node.data[key] || 0;

    node.data[key] = initial;
    this.props = {
      readonly,
      value: initial,
      onChange: v => {
        this.setValue(v);
        this.emitter.trigger("process");
        if (this.parent.node) {
          this.parent.node.update();
        } else {
          this.parent.update();
        }
      }
    };
  }

  setValue(val) {
    this.props.value = val;
    this.putData(this.key, val);
    this.update();
  }
}

class NumControl extends Rete.Control {
  static component = ({ value, onChange }) => (
    <input
      type="number"
      value={value}
      ref={ref => {
        ref && ref.addEventListener("pointerdown", e => e.stopPropagation());
      }}
      onChange={e => onChange(+e.target.value)}
    />
  );

  constructor(emitter, key, node, readonly = false) {
    super(key);
    this.emitter = emitter;
    this.key = key;
    this.component = NumControl.component;

    const initial = node.data[key] || 0;

    node.data[key] = initial;
    this.props = {
      readonly,
      value: initial,
      onChange: v => {
        this.setValue(v);
        this.emitter.trigger("process");
        if (this.parent.node) {
          this.parent.node.update();
        } else {
          this.parent.update();
        }
      }
    };
  }

  setValue(val) {
    this.props.value = val;
    this.putData(this.key, val);
    this.update();
  }
}

class ProxyComponent extends Rete.Component {
  constructor() {
    super("Proxy");
    this.data.component = ProxyNode; // optional
    this.label = "";
  }

  builder(node) {
    node.label = node.data.__rete_node_label;
    node.group = node.data.__group;
    var inp1 = new Rete.Input("num99", "Number", numSocket);
    node.addInput(inp1);

    for (var key in node.data) {
      if (key.startsWith("__")) {
        continue;
      }
      var data_type = typeof node.data[key];
      if (data_type === "string") {
        var inp3 = new ProxyControl(
          key,
          key,
          textSocket,
          false,
          node,
          this.editor,
          TextControl
        );
      } else {
        var inp1 = new ProxyControl(
          key,
          key,
          numSocket,
          false,
          node,
          this.editor,
          NumControl
        );
      }
    }

    return node;
  }

  worker(node, inputs, outputs) {
    var real_node = this.editor.nodes.find(n => n.id === node.id);
    for (var input_key in inputs) {
      var control = real_node.inputs.get(input_key).control;
      var control_value =
        control != null ? control.props.value : node.data[input_key];
      var value = inputs[input_key].length
        ? inputs[input_key][0]
        : control_value;
      outputs[input_key] = value;
      node.data[input_key] = value;
    }
    this.editor.nodes.find(n => n.id === node.id).update();
    // new Promise(resolve => setTimeout(resolve, 300)).then(() => {
    //   this.editor.nodes.find(n => n.id == node.id).update();
    // });
  }
}

class NumComponent extends Rete.Component {
  constructor() {
    super("Number");
    this.data.component = MyNode;
  }

  builder(node) {
    var out1 = new Rete.Output("num", "Number", numSocket);
    var out2 = new Rete.Output("num2", "any", anyTypeSocket);
    var ctrl = new NumControl(this.editor, "num", node);

    return node
      .addControl(ctrl)
      .addOutput(out1)
      .addOutput(out2);
  }

  worker(node, inputs, outputs) {
    outputs["num"] = node.data.num;
  }
}

class AddComponent extends Rete.Component {
  constructor() {
    super("Add");
    this.data.component = MyNode; // optional
  }

  builder(node) {
    var inp1 = new Rete.Input("num1", "Number", numSocket);
    var inp2 = new Rete.Input("num2", "Number2", numSocket);
    var out = new Rete.Output("num", "Number", numSocket);

    inp1.addControl(new NumControl(this.editor, "num1", node));
    inp2.addControl(new NumControl(this.editor, "num2", node));

    return node
      .addInput(inp1)
      .addInput(inp2)

      .addControl(new NumControl(this.editor, "preview", node, true))
      .addOutput(out);
  }

  worker(node, inputs, outputs) {
    var n1 = inputs["num1"].length ? inputs["num1"][0] : node.data.num1;
    var n2 = inputs["num2"].length ? inputs["num2"][0] : node.data.num2;
    var sum = n1 + n2;

    this.editor.nodes
      .find(n => n.id === node.id)
      .controls.get("preview")
      .setValue(sum);

    outputs["num"] = sum;
    node.data.num1 = n1;
    node.data.num2 = n2;
    this.editor.nodes.find(n => n.id === node.id).update();
    // new Promise(resolve => setTimeout(resolve, 100)).then(() => {

    // });
  }
}

var traversal_order = [];
function find_nodes_with_matching_data_and_input(this_node, editor, val) {
  var inputs = [];
  editor.nodes.map(n =>
    n.inputs.forEach((value, index, array) => {
      if (
        //find a possible connection
        n.id !== this_node.id &&
        !traversal_order.includes(n.id) &&
        value &&
        value.connections.length === 0 &&
        n.data[value.key] == this_node.data[val.key]
        // use double equal so that ints can be passed to strings
      ) {
        // check that the connection for this input isn't already being used for something else
        // avoid circular linking
        if (n.outputs.get(value.key) == null) {
          inputs.push(value);
        } else if (n.outputs.get(value.key).connections.length === 0) {
          inputs.push(value);
        } else {
          //don't push value
        }
      }
    })
  );
  traversal_order.push(this_node.id);
  return inputs;
}

// function find_nodes_with_matching_data_and_input(this_node, editor, val) {
//   var nodes = editor.nodes.filter(
//     n =>
//       n.id != this_node.id &&
//       Object.keys(n.data).some(
//         k => n.data[k] === this_node.data[val.key] && n.inputs.get(k)
//       )
//   );
//   return nodes;
// }

function find_nodes_by(editor, attr, key, val) {
  return editor.nodes.filter(n => n.data[key] && n[attr].get(key));
}

function has_input(node, key, value) {
  return node.outputs.find(n => n.key === key);
}

function has_output(node, key, value) {
  return true;
}

export async function createEditor(container) {
  var components = [
    new NumComponent(),
    new AddComponent(),
    new ProxyComponent()
  ];

  var editor = new Rete.NodeEditor("demo@0.1.0", container);
  editor.use(ConnectionPlugin, { curvature: 0.1 });
  editor.use(CommentPlugin, {
    margin: 55 // indent for new frame comments by default 30 (px)
  });
  editor.use(ReactRenderPlugin);
  editor.use(ContextMenuPlugin);
  editor.use(HistoryPlugin, { keyboard: true });

  editor.use(ConnectionPathPlugin, {
    type: ConnectionPathPlugin.DEFAULT, // DEFAULT or LINEAR transformer
    curve: ConnectionPathPlugin.curveBundle, // curve identifier
    options: { vertical: false, curvature: 0.35 }, // optional
    arrow: { marker: "M-5,-10 L-5,10 L20,0 z" }
  });

  var engine = new Rete.Engine("demo@0.1.0");

  components.map(c => {
    editor.register(c);
    engine.register(c);
  });

  var n1 = await components[0].createNode({ num: 2, num2: 4 });
  var n2 = await components[0].createNode({ num: 3, num2: 5 });
  var n3 = await components[2].createNode({
    __rete_node_label: "First Proxy",
    num1: 5,
    num2: 5,
    text1: "abc",
    num3: 65321
  });
  var n4 = await components[2].createNode({
    __rete_node_label: "Second Proxy",
    num1: 5,
    num2: 6,
    text1: "abc"
  });

  var n5 = await components[2].createNode({
    __rete_node_label: "Third Proxy",
    __group: "default",
    num1: 5,
    num2: 5,
    a: 5,
    text1: "abc",
    num3: 6,
    num4: 5,
    num5: 7,
    text2: "65321"
  });

  var add = await components[1].createNode();

  n1.position = [0, 100];
  n2.position = [0, 300];
  n3.position = [250, 500];
  n4.position = [1500, 750];
  n5.position = [950, 50];
  add.position = [400, 100];

  editor.addNode(n1);
  editor.addNode(n2);
  editor.addNode(n3);
  editor.addNode(n4);
  editor.addNode(n5);
  editor.addNode(add);

  var nodes = [n5, n4];
  var text = "GROUPA";
  var comments = [];

  // editor.connect(n1.outputs.get("num"), add.inputs.get("num1"));
  // editor.connect(n2.outputs.get("num"), add.inputs.get("num2"));
  // editor.connect(n2.outputs.get("num"), n3.inputs.get("num1"));
  // editor.connect(n3.outputs.get("num1"), n4.inputs.get("num1"));
  // editor.connect(n3.outputs.get("num2"), n4.inputs.get("num2"));
  // editor.connect(n3.outputs.get("text1"), n4.inputs.get("text1"));

  // console.log(editor);
  // WIP AUTOWIRE BASED ON DEFAULTS
  // console.log(
  //   editor.nodes.filter(n =>
  //     Object.keys(n.data).some(k => n.data[k] === 5 && n.inputs.get(k))
  //   )
  // );
  function wireConnections(value, key, map) {
    var inputs_to_wire = find_nodes_with_matching_data_and_input(
      value.node,
      editor,
      value
    );
    // console.log("Wiring", value.key, inputs_to_wire);
    for (var input in inputs_to_wire) {
      editor.connect(value, inputs_to_wire[input]);
    }
  }
  n3.outputs.forEach(wireConnections);
  n5.outputs.forEach(wireConnections);
  // for (var key in editor.nodes) {
  //   console.log(editor.nodes[key]);
  // }
  editor.on(
    "process nodecreated noderemoved connectioncreated connectionremoved",
    async () => {
      console.log("process");
      await engine.abort();
      await engine.process(editor.toJSON());
    }
  );

  editor.on(
    "addcomment commentselected commentcreated editcomment",
    async comment => {
      // UPDATE GROUP NAME FROM COMMENT
      console.log("added comment", comment.text);
      var node_views = comment.linkedNodesView();
      for (var node_view in node_views) {
        var current_node = node_views[node_view].node;
        current_node.data.__group = comment.text;
        current_node.group = comment.text;
        current_node.update();
      }
      comment.update();
    }
  );

  editor.trigger("addcomment", { type: "frame", text, nodes });

  editor.view.resize();
  // AreaPlugin.zoomAt(editor, nodes);

  editor.trigger("process");
}
