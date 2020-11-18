import React from 'react';
import './SettingsForm.scss';
import { buildBemClassName } from '../modules/util';
import NoteSelection, { NoteGroupChangeHandler } from './NoteSelection';
import { NoteGroupTypeSelectionMap } from '../modules/note';
import TimeSignatureSelection from './TimeSignatureSelection';
import { TimeSignature, TimeSignatureType } from '../modules/time-signature';
import MeasureCountSelection from './MeasureCountSelection';
import { NoteGroupMultiSelectChangeHandler } from './NoteCheckboxGroup';
import Accordion from './Accordion';
import PlaybackSettings from './PlaybackSettings';
import { TempoChangeHandler } from './TempoControl';

export interface SettingsFormProps {
  openAccordion: string;
  tempo: number;
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  timeSignatures: TimeSignature[];
  selectedTimeSignature: TimeSignature;
  measureCountOptions: number[];
  selectedMeasureCount: number;
  errorMessage: string;
  onTempoChange: TempoChangeHandler;
  onNoteGroupChange: NoteGroupChangeHandler;
  onNoteGroupMultiSelectChange: NoteGroupMultiSelectChangeHandler;
  onTimeSignatureChange: (newTimeSignature: TimeSignatureType) => void;
  onMeasureCountChange: (measureCount: number) => void;
  onOpenAccordionChange: (accordionOpened: string) => void;
  onAccordionTransitionComplete: (open: boolean, id: string) => void;
}

const buildClassName = buildBemClassName('c-rr-settings-form');

const SettingsForm = ({
  openAccordion,
  tempo,
  noteGroupTypeSelectionMap,
  timeSignatures,
  selectedTimeSignature,
  measureCountOptions,
  selectedMeasureCount,
  errorMessage,
  onTempoChange,
  onNoteGroupChange,
  onNoteGroupMultiSelectChange,
  onTimeSignatureChange,
  onMeasureCountChange,
  onOpenAccordionChange,
  onAccordionTransitionComplete,
}: SettingsFormProps) => {
  const handleAccordionToggleClick = (id: string, currentlyOpen: boolean) => {
    if (currentlyOpen) {
      onOpenAccordionChange(id);
    }
  };

  return (
    <form className={buildClassName()()}>
      {errorMessage && (
        <p className={buildClassName('error-message')()}>{errorMessage}</p>
      )}
      <Accordion
        id="playback-settings-accordion"
        isOpen={openAccordion === 'playback-settings-accordion'}
        onToggleClick={handleAccordionToggleClick}
        onTransitionComplete={onAccordionTransitionComplete}
        renderButtonContents={() => 'Playback Settings'}
        renderPaneContents={() => {
          return (
            <PlaybackSettings tempo={tempo} onTempoChange={onTempoChange} />
          );
        }}
      />
      <Accordion
        id="measure-count-selection-accordion"
        isOpen={openAccordion === 'measure-count-selection-accordion'}
        onToggleClick={handleAccordionToggleClick}
        onTransitionComplete={onAccordionTransitionComplete}
        renderButtonContents={() => 'Measure Count Selection'}
        renderPaneContents={() => {
          return (
            <MeasureCountSelection
              measureCountOptions={measureCountOptions}
              selectedMeasureCount={selectedMeasureCount}
              onMeasureCountChange={onMeasureCountChange}
            />
          );
        }}
      />
      <Accordion
        id="time-signature-selection-accordion"
        isOpen={openAccordion === 'time-signature-selection-accordion'}
        onToggleClick={handleAccordionToggleClick}
        onTransitionComplete={onAccordionTransitionComplete}
        renderButtonContents={() => 'Time Signature Selection'}
        renderPaneContents={() => {
          return (
            <TimeSignatureSelection
              timeSignatures={timeSignatures}
              selectedTimeSignature={selectedTimeSignature}
              onTimeSignatureChange={onTimeSignatureChange}
            />
          );
        }}
      />
      <Accordion
        id="note-selection-accordion"
        isOpen={openAccordion === 'note-selection-accordion'}
        onToggleClick={handleAccordionToggleClick}
        onTransitionComplete={onAccordionTransitionComplete}
        renderButtonContents={() => 'Note Selection'}
        renderPaneContents={() => {
          return (
            <NoteSelection
              noteGroupTypeSelectionMap={noteGroupTypeSelectionMap}
              onNoteGroupChange={onNoteGroupChange}
              onNoteGroupMultiSelectChange={onNoteGroupMultiSelectChange}
            />
          );
        }}
      />
    </form>
  );
};

export default SettingsForm;
