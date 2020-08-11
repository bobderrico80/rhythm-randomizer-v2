import React, { useState, useEffect } from 'react';
import throttle from 'lodash/throttle';
import './App.scss';
import { NoteGroupType } from './modules/note';
import Score from './components/Score';
import { getRandomMeasures } from './modules/random';
import { Measure } from './modules/vex';
import { getTimeSignature, TimeSignatureType } from './modules/time-signature';
import Header from './components/Header';

const THROTTLE_INTERVAL = 200; // ms

const App = () => {
  const [measureCount, setMeasureCount] = useState(8);
  const [timeSignature, setTimeSignature] = useState(
    getTimeSignature(TimeSignatureType.SIMPLE_4_4)
  );
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  const [noteTypes, setNoteTypes] = useState([
    NoteGroupType.W,
    NoteGroupType.H,
    NoteGroupType.Q,
    NoteGroupType.WR,
    NoteGroupType.HR,
    NoteGroupType.QR,
    NoteGroupType.EE,
    NoteGroupType.SSSS,
    NoteGroupType.SSE,
    NoteGroupType.SES,
    NoteGroupType.ESS,
    NoteGroupType.TQQQ,
    NoteGroupType.TEEE,
    NoteGroupType.HD,
    NoteGroupType.QDE,
    NoteGroupType.EQD,
    NoteGroupType.EDS,
    NoteGroupType.SED,
    NoteGroupType.EER,
    NoteGroupType.ERE,
    NoteGroupType.SSER,
    NoteGroupType.ERSS,
    NoteGroupType.EQE,
    NoteGroupType.EQQE,
    NoteGroupType.EQQQE,
  ]);

  // TODO: Handle errors from `getRandomMeasures`
  const [measures, setMeasures] = useState<Measure[]>(
    getRandomMeasures(noteTypes, timeSignature.beatsPerMeasure, measureCount)
  );

  useEffect(() => {
    const handleWindowResize = throttle(() => {
      setInnerWidth(window.innerWidth);
    }, THROTTLE_INTERVAL);

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

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
      <Header handleRandomizeClick={handleRandomizeClick} />
      <Score
        timeSignature={timeSignature}
        measures={measures}
        innerWidth={innerWidth}
      />
    </div>
  );
};

export default App;
