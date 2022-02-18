//import { MIDIFile, MIDIFileHeader, MIDIEvents } from "midifile";
//import MIDIFile from 'midifile';

let midifile;
import("midifile").then(module => { midifile = module });
let fs;
import("fs").then(module => { midifile = module });

//var MIDIFile = require('../src/MIDIFile.js');
//var MIDIFileHeader = require('../src/MIDIFileHeader.js');
//var MIDIEvents = require('midievents');
let filename = '../midi/reference/scales/c-major.mid';
// let filename = '../midi/bach_846_format0.mid';


function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    var i;
  
    for (i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return ab;
}
  

function readFileAsArrayBuffer(file) {
    return toArrayBuffer(fs.readFileSync(file));
}

  // Your variable with your MIDI file as an ArrayBuffer or UInt8Array instance
var anyBuffer = readFileAsArrayBuffer(filename);

// Creating the MIDIFile instance
var midiFile = new midifile.MIDIFile(anyBuffer);
// Reading headers
midiFile.header.getFormat(); // 0, 1 or 2
midiFile.header.getTracksCount(); // n
// Time division
if(midiFile.header.getTimeDivision() === midifile.MIDIFile.Header.TICKS_PER_BEAT) {
	midiFile.header.getTicksPerBeat();
} else {
	midiFile.header.getSMPTEFrames();
	midiFile.header.getTicksPerFrame();
}

// MIDI events retriever
var events = midiFile.getMidiEvents();
events[0].subtype; // type of [MIDI event](https://github.com/nfroidure/MIDIFile/blob/master/src/MIDIFile.js#L34)
events[0].playTime; // time in ms at wich the event must be played
events[0].param1; // first parameter
events[0].param2; // second one

// Lyrics retriever
var lyrics = midiFile.getLyrics();
if ( lyrics.length ) {
	lyrics[0].playTime; // Time at wich the text must be displayed
	lyrics[0].text; // The text content to be displayed
}

// Reading whole track events and filtering them yourself
var events = midiFile.getTrackEvents(0);

events.forEach(console.log.bind(console));

// Or for a single track
var trackEventsChunk = midiFile.tracks[0].getTrackContent();
var events = midifile.MIDIEvents.createParser(trackEventsChunk);

var event;
while(event = events.next()) {
	// Printing meta events containing text only
	if(event.type === midifile.MIDIEvents.EVENT_META && event.text) {
		console.log('Text meta: '+event.text);
	}
}