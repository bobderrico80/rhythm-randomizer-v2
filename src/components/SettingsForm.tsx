import React from 'react';
import './SettingsForm.scss';
import { buildBemClassName } from '../modules/util';
import NoteSelection, { NoteGroupChangeHandler } from './NoteSelection';
import { NoteGroupTypeSelectionMap } from '../modules/note';
import TimeSignatureSelection from './TimeSignatureSelection';
import { TimeSignature, TimeSignatureType } from '../modules/time-signature';
import MeasureCountSelection from './MeasureCountSelection';

export interface SettingsFormProps {
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  timeSignatures: TimeSignature[];
  selectedTimeSignature: TimeSignature;
  measureCountOptions: number[];
  selectedMeasureCount: number;
  errorMessage: string;
  onNoteGroupChange: NoteGroupChangeHandler;
  onTimeSignatureChange: (newTimeSignature: TimeSignatureType) => void;
  onMeasureCountChange: (measureCount: number) => void;
}

const buildClassName = buildBemClassName('c-rr-settings-form');

const SettingsForm = ({
  noteGroupTypeSelectionMap,
  timeSignatures,
  selectedTimeSignature,
  measureCountOptions,
  selectedMeasureCount,
  errorMessage,
  onNoteGroupChange,
  onTimeSignatureChange,
  onMeasureCountChange,
}: SettingsFormProps) => {
  return (
    <form className={buildClassName()()}>
      {errorMessage && (
        <p className={buildClassName('error-message')()}>{errorMessage}</p>
      )}
      <MeasureCountSelection
        measureCountOptions={measureCountOptions}
        selectedMeasureCount={selectedMeasureCount}
        onMeasureCountChange={onMeasureCountChange}
      />
      <TimeSignatureSelection
        timeSignatures={timeSignatures}
        selectedTimeSignature={selectedTimeSignature}
        onTimeSignatureChange={onTimeSignatureChange}
      />
      <NoteSelection
        onNoteGroupChange={onNoteGroupChange}
        noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
      />
    </form>
  );
};

export default SettingsForm;
