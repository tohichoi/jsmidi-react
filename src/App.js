import logo from './logo.svg';
import './App.css';
import React from 'react';
import { tab } from '@testing-library/user-event/dist/tab';
var Statistics = require('statistics.js');

// import { Col, Form, Row } from 'react-bootstrap';
// import { Button } from 'react-bootstrap'
//import { WebMidi } from "webmidi";

const MIDIFile = require('midifile');
// const MIDIFileTrack = require('MIDIFileTrack');
const MIDIEvents = require('midievents');
//const Utilitiies = require('utilities');
const {Utilities, WebMidi, Note} = require("webmidi");


class Action extends React.Component {
  render() {
    return <form>
      <fieldset>
        <legend>Actions</legend>
        <input id='id-action-record' type="button" value="Record" />
        <input id='id-action-play' type="button" value="Play" />
        <input id='id-action-stop' type="button" value="Stop" />
        <br></br>
        <input id='id-action-analyze' type="button" value="Analyze" />
      </fieldset>
    </form>;
  }
}


class ResultBasicStatisticsPanel extends React.Component {
  get_html(stat) {
    let html;
    if (stat) {
      html = <ul>
        <li>Mean: {stat.average} </li>
        <li>Variance: {stat.variance} </li>
        <li>Min: {stat.min} </li>
        <li>Max: {stat.max} </li>
      </ul>
    } else {
      <p>Please record or open file</p>
    }

    return html;
  }

  render() {
    let s = this.props.statistics;
    let html = this.get_html(s);
    return <>
      <div className='stat-panel'>
        <div className='stat-panel-header'>
          { s ? s.name : 'undefined' }
        </div>
        <div className='stat-component'>
          { html }
        </div>
      </div>
    </>
  }
}


class ChannelPanel extends React.Component {
  render() {
    let html;
    if (this.props.notes) {
      let s = new PlayStatistics(this.props.notes);
      html = <>
        <ResultBasicStatisticsPanel statistics={s.statistics ? s.statistics['velocity'] : null} />
        <ResultBasicStatisticsPanel statistics={s.statistics ? s.statistics['duration'] : null} />
        <ResultBasicStatisticsPanel statistics={s.statistics ? s.statistics['attack_time'] : null} />
      </>
    } else
      html = ''

    return <>
      <div className='channel-panel'>
        <div className='channel-panel-header'>
          Channel { this.props.value }
        </div>
        <div className='stat-container'>
          { html }
        </div>
      </div>
    </>
      
  }
}


class TrackPanel extends React.Component {
  render() {
    let c = this.props.channels;
    let valid_channels = c ? c.filter((notes, i) => notes.length > 0) : null;
    return <>
      <div className='track-panel'>
      <div className='track-panel-header'>
        Track { this.props.value }
      </div>
      <div className='channel-container'>
        {
          (valid_channels) ? valid_channels.map((notes, i) => <ChannelPanel notes={notes} key={i.toString()} value={ i } />) : ''
        }
        </div>
        </div>
    </>
  }
}

// tracks : 전체 track
class TrackContainer extends React.Component {
  render() {
    return <>
      <div className='track-container'>
        {
          this.props.tracks ? this.props.tracks.map((track, i) => <TrackPanel channels={track} key={i.toString()} value={i} />) : <TrackPanel channels={null} />
        }
      </div>
    </>
  }
}


class MIDIFilePanel extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onMIDIFileChange(event.target.files[0]);
  }

  getFileInfo(md) {
    let fileinfo = "N/A";
    
    if (md) {
      //let events = md.getMidiEvents();
      // let notes = this.convertRawMidiMessageToNote(events);
      fileinfo = <>
        <table border="1">
          <tbody>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>Format</td>
              <td>{md.header.getFormat()}</td>
            </tr>
            {
              (() => {
                if (md.header.getTimeDivision() === MIDIFile.Header.TICKS_PER_BEAT) {
                  return <><tr>
                    <td>Ticks per beat</td>
                    <td>{md.header.getTicksPerBeat()}</td>
                  </tr>
                  </>;
                } else {
                  return <><tr>
                    <td>Ticks per frame</td>
                    <td>{md.header.getTicksPerFrame()}</td>
                  </tr>
                  <tr>
                    <td>Number of frames</td>
                    <td>{md.header.getSMPTEFrames()}</td>
                  </tr>
                  </>
                }
              })()
            }
            <tr>
              <td>Number of tracks</td>
              <td>{md.header.getTracksCount()}</td>
            </tr>
            <tr>
              <td>Number of events</td>
              <td>TBD</td>
            </tr>
          </tbody>
        </table>
      </>;
    }

    return fileinfo;
  }

  render() {
    let md = (this.props && this.props.midifile) ? this.props.midifile : null;

    return <form>
      <fieldset>
        <legend>MIDI File</legend>
        <label for='id-midifile'>MIDI File</label>
        <input id='id-midifile' type="file" onChange={ this.handleChange } />
      </fieldset>
      { this.getFileInfo(md) }
    </form>;
  }
}

class MIDIInstrument extends React.Component {
  render() {
    return <form>
      <fieldset>
        <legend>MIDI Instrument</legend>
        <label for='id-bank'>Bank</label>
        <input id='id-bank' type="text" placeholder='Enter bank number'></input>
        <br></br>
        <label for='id-patch'>Patch</label>
        <input id='id-patch' type="text" placeholder='Enter patch number'></input>
      </fieldset>
    </form>;
  }
}

class MIDIDevice extends React.Component {
  render() {
    return <form>
      <fieldset>
        <legend>MIDI Device</legend>
        <label for='id-input-device'>Input Device</label>
        <input id='id-input-device' type="text" placeholder='Enter input device name'></input>
        <br></br>
        <label for='id-output-device'>Output Device</label>
        <input id='id-output-device' type="text" placeholder='Enter output device name'></input>
      </fieldset>
    </form>;
  }
}


class PlayStatistics extends Object {
  constructor(notes) {
    super();
    this.notes = JSON.parse(JSON.stringify(notes));
    this.stat = new Statistics(this.notes, {
      _attack: 'metric', _duration: 'metric', _name: 'nominal',
      _octave: 'metric', _release: 'metric', playTime: 'metric',
    }, { excludeColumns: '_accidental' })
    this.statistics = {}
    this.calc_stat(notes);
  }
  
  calc_stat(notes) {
    // average velocity, variance, min, max
    let pa = this;

    function calc_base_stat(stat, k, name) {
      let s = {}
      s.name = name;
      s.average = stat.arithmeticMean(k);
      s.variance = stat.standardDeviation(k);
      s.min = stat.minimum(k);
      s.max = stat.maximum(k);
      return s;
    }

    function calc_attack_precision() {
      let d = pa.stat.getColumn('playTime');
      let data = [];
      for (let i = 1; i < d.length; i++) {
        data.push({attack_time: d[i] - d[i - 1]});
      }
      let s = new Statistics(data, { attack_time: 'metric' });
      return calc_base_stat(s, 'attack_time', 'Attack Time Precision');
    }

    this.statistics['velocity'] = calc_base_stat(pa.stat, '_attack', 'Velocity');
    this.statistics['duration'] = calc_base_stat(pa.stat, '_duration', 'Duration');
    this.statistics['attack_time'] = calc_attack_precision();
    
    return this.statistics;
  }
}


class MIDIMainContainer extends React.Component {
  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.state = {
      inputs: [],
      outputs: [],
      bank: 0,
      patch: 1,
      midifile: null,
      tracks: null,
    }

    this.handleMIDIFileChange = this.handleMIDIFileChange.bind(this);
    //this.onMIDIEnabled = this.onMIDIEnabled.bind(this);
  }

  // Function triggered when WebMidi.js is ready
  onMIDIEnabled() {
    // Display available MIDI input devices
    if (WebMidi.inputs.length < 1) {
      document.body.innerHTML+= "No device detected.";
    } else {
      WebMidi.inputs.forEach((device, index) => {
        document.body.innerHTML+= `${index}: ${device.name} <br>`;
      });
    }

  }
  
  componentDidMount() {
    WebMidi
    .enable()
    .then(this.onMIDIEnabled)
    .catch(err => alert(err));
  }

  componentWillUnmount() {
  }

  convertRawMidiMessageToNote(events) {
    let channellookup = new Array(128);
    // managing on/off for each note
    let notebuffer = new Array(128);
    for(let i = 0; i < 32; i++) {
      channellookup[i] = [];
      notebuffer[i] = {};
    }

    for (let i = 0; i < events.length; i++) {
      let e = events[i];
      let param2 = 0;
      let note = null;

      if (e.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON) {
        // create note object
        // name, velocity, duration = playtime, 
        param2 = Math.floor(e.param2 * ((this.volume || 100) / 100));
        note = new Note(e.param1, { rawAttack: param2, duration: e.playTime });
        note.playTime = e.playTime;
        // insert to channellookup
        notebuffer[e.channel][e.param1] = note;
      } else if (e.subtype === MIDIEvents.EVENT_MIDI_NOTE_OFF) {
        // lookup note object
        let note = notebuffer[e.channel][e.param1];
        // update duration
        //   duration: current playtime - note's playtime
        note.duration = e.playTime - note.playTime;
        channellookup[e.channel].push(note);
        delete notebuffer[e.channel][e.param1];
      }
    }

    // channellookup.forEach(notes => {
    //   if (notes.length > 0)
    //     console.log(notes);
    // });

    return channellookup;
  }
 
  handleMIDIFileChange(file) {
    let reader = new FileReader();
    reader.onload = event => {
      let buffer = event.target.result;
      let midifile = new MIDIFile(buffer);      
      let tracks = [];
      let playTime = 0;
      let tickResolution = midifile.header.getTickResolution();
      for (let i = 0; i < midifile.tracks.length; i++) {
        let track_chunk = midifile.tracks[i].getTrackContent();
        let events = MIDIEvents.createParser(track_chunk);
        let events_array = [];
        let event;
        playTime = 2 === midifile.header.getFormat() && playTime ? playTime : 0;
        while ((event = events.next())) {
          playTime += event.delta ? event.delta * tickResolution / 1000 : 0;
          events_array.push(event);
          event.playTime = playTime; 
        }
        let channels = this.convertRawMidiMessageToNote(events_array);
        tracks.push(channels);
      };

      this.setState({
        midifile: midifile,
        tracks: tracks,
      });
      // console.log(this.state);

    }
    reader.readAsArrayBuffer(file);
  }

  // onMIDIFileChange 는 MIDIFile 의 property 로 들어감
  // MIDIFile 에서 this.prop.onMIDIFileChange 로 참조
  // MIDIMainContainer 에서 onMIDIFileChange = handleMIDIFileChange 로 정의되었으므로
  // MIDIFile.onMIDIFileChange 는 MIDIMainContainer 의 handleMIDIFileChange 를 호출함 
  render() {
    return <>
      <div className='control-container'>
        <div>
          <h1>Live analysis</h1>
          <MIDIDevice />
          <MIDIInstrument />
        </div>
        <div>
          <h1>Recorded file(MIDI) analysis</h1>
          <MIDIFilePanel onMIDIFileChange={this.handleMIDIFileChange} midifile={this.state.midifile} notes={this.state.tracks} />
        </div>
        <div>
          <Action />
        </div>
      </div>
      <div className='result-container'>
        <TrackContainer tracks={this.state.tracks} />
      </div>
    </>
  }
}

function App() {
  return (    
    <div className="App">
      <MIDIMainContainer />
    </div>
  );
}

export default App;
