import React, { useState } from 'react';
import './App.css';
import { NoteDefinition, NoteType } from './modules/note';
import Score from './components/Score';
import { getRandomMeasures } from './modules/random';
import {
  getTimeSignatureDefinition,
  TimeSignatureType,
} from './modules/time-signature';

const App = () => {
  const [measureCount, setMeasureCount] = useState(16);
  const [timeSignature, setTimeSignature] = useState(
    getTimeSignatureDefinition(TimeSignatureType.SIMPLE_4_4)
  );
  const [noteTypes, setNoteTypes] = useState([
    NoteType.N1,
    NoteType.N2,
    NoteType.N2D,
    NoteType.N4,
    // NoteType.N4D_N8,
    // NoteType.N4T_N4T_N4T,
    // NoteType.N8_N4D,
    NoteType.N8_N8,
    // NoteType.N8_N16_N16,
    // NoteType.N8_R8,
    // NoteType.N8D_N16,
    NoteType.N8T_N8T_N8T,
    // NoteType.N16_N8_N16,
    // NoteType.N16_N8D,
    // NoteType.N16_N16_N8,
    NoteType.N16_N16_N16_N16,
    // NoteType.N16_N16_R8,
    NoteType.R1,
    NoteType.R2,
    NoteType.R4,
    // NoteType.R8_N8,
    // NoteType.R8_N16_N16,
  ]);

  // TODO: Handle errors from `getRandomMeasures`
  const [measures, setMeasures] = useState<NoteDefinition[][]>(
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
      <Score
        timeSignature={timeSignature}
        measures={measures}
        measuresPerStaff={4}
      />
    </div>
  );
};

export default App;
