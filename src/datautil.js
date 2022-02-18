import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Button } from 'react-bootstrap'
import { WebMidi } from "webmidi";


function randomize() {
    let midiParser  = require('midi-parser-js');
    let fs = require('fs')
    var midiArray;
    let filename = '../midi/bach_846_format0.mid';
    // read a .mid binary (as base64)
    fs.readFile(filename, 'base64', function (err,data) {
    // Parse the obtainer base64 string ...
    midiArray = midiParser.parse(data);
    // done!
        console.log(midiArray);
        
        midiArray.track.forEach(track => {
            console.log(track);
        });
    });
}

