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

export interface SettingsFormProps {
  openAccordion: string;
  noteGroupTypeSelectionMap: NoteGroupTypeSelectionMap;
  timeSignatures: TimeSignature[];
  selectedTimeSignature: TimeSignature;
  measureCountOptions: number[];
  selectedMeasureCount: number;
  errorMessage: string;
  onNoteGroupChange: NoteGroupChangeHandler;
  onNoteGroupMultiSelectChange: NoteGroupMultiSelectChangeHandler;
  onTimeSignatureChange: (newTimeSignature: TimeSignatureType) => void;
  onMeasureCountChange: (measureCount: number) => void;
  onOpenAccordionChange: (accordionOpened: string) => void;
}

const buildClassName = buildBemClassName('c-rr-settings-form');

const SettingsForm = ({
  openAccordion,
  noteGroupTypeSelectionMap,
  timeSignatures,
  selectedTimeSignature,
  measureCountOptions,
  selectedMeasureCount,
  errorMessage,
  onNoteGroupChange,
  onNoteGroupMultiSelectChange,
  onTimeSignatureChange,
  onMeasureCountChange,
  onOpenAccordionChange,
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
        id="measure-count-selection-accordion"
        isOpen={openAccordion === 'measure-count-selection-accordion'}
        onToggleClick={handleAccordionToggleClick}
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
