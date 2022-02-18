import logo from './logo.svg';
import './App.css';
import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Button } from 'react-bootstrap'
import { WebMidi } from "webmidi";

const MIDIFile = require('midifile');
// const MIDIFileTrack = require('MIDIFileTrack');
const MIDIEvents = require('midievents');


class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  handleFileSubmit(event) {
    event.preventDefault();
    let reader = new FileReader();
    this.setState({ mididata: reader.readAsArrayBuffer(this.fileInput.current.files[0].path) });
    console.log(this.props.mididata);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Upload file:
          <input type="file" ref={this.fileInput} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }
}

class MIDIFileInfo extends React.Component {
  render() {
    return (
      <FileInput onChange={ this.onMIDIFIleChange }/>
    )
  }
}

class MIDIDeviceForm extends React.Component {
  render() {
    const inputs = this.state.inputs;
    if (!inputs)
      return <p>No input device found</p>
    const i_options = inputs.map((input) => 
      <option key={input.id}>{input.name}</option>
    );

    const outputs = this.state.outputs;
    if (!outputs)
      return <p>No output device found</p>
    const o_options = inputs.map((output) => 
      <option key={output.id}>{output.name}</option>
      );

    return <Form onSubmit={this.handleSubmit}>
      <Row className="align-items-center">
        <Col lg="auto">
          <Form.Label>Input Devices</Form.Label>
          <Form.Select id="id-input-devices">{i_options}</Form.Select>
        </Col>
        <Col lg="auto">
          <Form.Label>Output Devices</Form.Label>
          <Form.Select id="id-output-devices">{o_options}</Form.Select>
        </Col>
        <Col lg="auto">
          <Button variant="primary" type="submit" onSubmit={this.handleSubmit}>Connect to device</Button>
        </Col>
      </Row>
    </Form>
  }
}


class MIDIInstrumentForm extends React.Component {
  render() {
    return <Form onSubmit={this.handleSubmit}>
      <Row className="align-items-center">
        <Col lg="auto">
          <Form.Label htmlFor="id-bank">Bank</Form.Label>
          <Form.Control type="number" id="id-bank" onChange={this.handleBankChange}></Form.Control>
        </Col>
        <Col lg="auto">
          <Form.Label htmlFor="id-patch">Patch</Form.Label>
          <Form.Control type="input" id="id-patch" onChange={this.handlePatchChange}></Form.Control>
        </Col>
        <Col lg="auto">
          <Button variant="primary" type="submit" onSubmit={this.handleSubmit}>Change Instrument</Button>
        </Col>
      </Row>
    </Form>
  }
}


class MIDIPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inputs: [],
      outputs: [],
      bank: 0,
      patch: 1,
      mididata: null,
    }

    this.handleChange = this.handleBankChange.bind(this);
    this.handleChange = this.handlePatchChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onMIDIFIleChange = this.onMIDIFIleChange.bind(this);
  }

  handleBankChange(event) {
    // bank changed
    this.setState({bank: parseInt(event.target.value)});
  }

  handlePatchChange(event) {
    // patch changed
    this.setState({patch: parseInt(event.target.value)});
  }

  handleInputChange(event) {
    // connect to selected input device
    //this.setState({value: event.target.value});
  }

  handleOutputChange(event) {
    // connect to selected output device
    //this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    console.log(this.state);
    event.preventDefault();
  }

  onMIDIFIleChange(event) {
    event.preventDefault();
    let reader = new FileReader();
    this.setState({ mididata: reader.readAsArrayBuffer(this.fileInput.current.files[0].path) });
    console.log(this.props.mididata);
  }

  onMIDIEnabled(e) {
    // Inputs
    WebMidi.inputs.forEach(input => console.log(input));
    // WebMidi.inputs.forEach(input => console.log(input.manufacturer, input.name));
    // Outputs
    WebMidi.outputs.forEach(output => console.log(output));
    // WebMidi.outputs.forEach(output => console.log(output.manufacturer, output.name));

    this.setState({inputs: Array.from(WebMidi.inputs.values())});
    this.setState({ outputs: Array.from(WebMidi.outputs.values()) });
    
    const myInput = WebMidi.getInputByName("out");
    myInput.addListener("noteon", e => {
      console.log('ON', e.note.identifier, e.note.rawAttack);
    });
    myInput.addListener("noteoff", e => {
      console.log('OFF', e.note.identifier, e.note.rawAttack);
    });

    function onNoteOn(event) {
      WebMidi.outputs[0].playNote(
        // You could also use event.note.number but this
        // is better for debugging.
        event.note.name + event.note.octave,
        event.channel,
        {
          velocity: event.velocity,
        }
      );
    }
  }

  componentDidMount() {
    WebMidi.enable().then(this.onMIDIEnabled).catch(err => alert(err));
  }

  componentWillUnmount() {
    ;
  }

  render() {
    return <>
      <Row>
        <Col>
          <MIDIDeviceForm onMIDIEnabled={ this.onMIDIEnabled }/>
        </Col>
      </Row>
      <Row>
        <Col>
          <MIDIInstrumentForm />
        </Col>
      </Row>
      <Row>
        <Col>
          <MIDIFileInfo />
        </Col>
      </Row>
    </>
  }
}

function App() {
  return (    
    <div className="App">
      <header className="App-header">
        <MIDIPanel />
      </header>
    </div>
  );
}

export default App;
