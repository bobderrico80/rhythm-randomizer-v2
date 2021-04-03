import React from 'react';
import './SettingsForm.scss';
import { buildBemClassName } from '../modules/util';
import NoteSelection from './NoteSelection';
import TimeSignatureSelection from './TimeSignatureSelection';
import { TimeSignature } from '../modules/time-signature';
import MeasureCountSelection from './MeasureCountSelection';
import Accordion from './Accordion';
import PlaybackSettings from './PlaybackSettings';
import { useTranslation } from 'react-i18next';

export interface SettingsFormProps {
  openAccordion: string;
  timeSignatures: TimeSignature[];
  measureCountOptions: number[];
  errorMessage: string;
  onOpenAccordionChange: (accordionOpened: string) => void;
  onAccordionTransitionComplete: (open: boolean, id: string) => void;
}

const buildClassName = buildBemClassName('c-rr-settings-form');

const SettingsForm = ({
  openAccordion,
  timeSignatures,
  measureCountOptions,
  errorMessage,
  onOpenAccordionChange,
  onAccordionTransitionComplete,
}: SettingsFormProps) => {
  const { t } = useTranslation();

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
        paneLabel={t('playbackSettings')}
        isOpen={openAccordion === 'playback-settings-accordion'}
        onToggleClick={handleAccordionToggleClick}
        onTransitionComplete={onAccordionTransitionComplete}
        renderButtonContents={() => t('playbackSettings')}
        renderPaneContents={() => {
          return <PlaybackSettings />;
        }}
      />
      <Accordion
        id="measure-count-selection-accordion"
        paneLabel={t('measureCountSelection')}
        isOpen={openAccordion === 'measure-count-selection-accordion'}
        onToggleClick={handleAccordionToggleClick}
        onTransitionComplete={onAccordionTransitionComplete}
        renderButtonContents={() => t('measureCountSelection')}
        renderPaneContents={() => {
          return (
            <MeasureCountSelection measureCountOptions={measureCountOptions} />
          );
        }}
      />
      <Accordion
        id="time-signature-selection-accordion"
        paneLabel={t('timeSignatureSelection')}
        isOpen={openAccordion === 'time-signature-selection-accordion'}
        onToggleClick={handleAccordionToggleClick}
        onTransitionComplete={onAccordionTransitionComplete}
        renderButtonContents={() => t('timeSignatureSelection')}
        renderPaneContents={() => {
          return <TimeSignatureSelection timeSignatures={timeSignatures} />;
        }}
      />
      <Accordion
        id="note-selection-accordion"
        paneLabel={t('noteSelection')}
        isOpen={openAccordion === 'note-selection-accordion'}
        onToggleClick={handleAccordionToggleClick}
        onTransitionComplete={onAccordionTransitionComplete}
        renderButtonContents={() => t('noteSelection')}
        renderPaneContents={() => {
          return <NoteSelection />;
        }}
      />
    </form>
  );
};

export default SettingsForm;
