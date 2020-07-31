import React, { useState } from 'react';
import './App.css';
import { NoteGroupType } from './modules/note';
import Score from './components/Score';
import { getRandomMeasures } from './modules/random';
import { Measure } from './modules/vex';
import { getTimeSignature, TimeSignatureType } from './modules/time-signature';

const App = () => {
  const [measureCount, setMeasureCount] = useState(16);
  const [timeSignature, setTimeSignature] = useState(
    getTimeSignature(TimeSignatureType.SIMPLE_4_4)
  );

  const [noteTypes, setNoteTypes] = useState([
    // NoteGroupType.W,
    // NoteGroupType.H,
    NoteGroupType.Q,
    // NoteGroupType.WR,
    // NoteGroupType.HR,
    NoteGroupType.QR,
    NoteGroupType.EE,
    // NoteGroupType.SSSS,
    // NoteGroupType.SSE,
    // NoteGroupType.SES,
    // NoteGroupType.ESS,
    // NoteGroupType.TQQQ,
    // NoteGroupType.TEEE,
    // NoteGroupType.HD,
    // NoteGroupType.QDE,
    // NoteGroupType.EQD,
    // NoteGroupType.EDS,
    // NoteGroupType.SED,
    // NoteGroupType.EER,
    NoteGroupType.ERE,
    // NoteGroupType.SSER,
    // NoteGroupType.ERSS,
    NoteGroupType.EQE,
    NoteGroupType.EQQE,
    NoteGroupType.EQQQE,
  ]);

  // TODO: Handle errors from `getRandomMeasures`
  const [measures, setMeasures] = useState<Measure[]>(
    getRandomMeasures(noteTypes, timeSignature.beatsPerMeasure, measureCount)
  );

  const setNextMeasures = () => {
    const nextMeasures = getRandomMeasures(
      noteTypes,
      timeSignature.beatsPerMeasure,
      measureCount
    );
    setMeasures(nextMeasures);
  };

  const handleRandomizeClick = () => {
    setNextMeasures();
  };

  return (
    <div className="c-rr-app">
      <button onClick={handleRandomizeClick}>New Rhythm</button>
      <Score timeSignature={timeSignature} measures={measures} />
    </div>
  );
};

export default App;
