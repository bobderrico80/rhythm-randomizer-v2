import React from 'react';
import classnames from 'classnames';
import {
  categorizeTimeSignatures,
  TimeSignature,
  TimeSignatureType,
} from '../modules/time-signature';
import { buildBemClassName } from '../modules/util';
import './TimeSignatureSelection.scss';

export interface TimeSignatureSelectionProps {
  timeSignatures: TimeSignature[];
  selectedTimeSignature: TimeSignature;
  onTimeSignatureChange: (newTimeSignature: TimeSignatureType) => void;
}

const buildClassName = buildBemClassName('c-rr-time-signature-selection');

const TimeSignatureSelection = ({
  timeSignatures,
  selectedTimeSignature,
  onTimeSignatureChange,
}: TimeSignatureSelectionProps) => {
  const handleTimeSignatureChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    onTimeSignatureChange(event.currentTarget.name as TimeSignatureType);
  };
  const categorizedTimeSignatures = categorizeTimeSignatures(timeSignatures);

  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      {categorizedTimeSignatures.map((categorizedTimeSignature) => {
        return (
          <fieldset
            key={categorizedTimeSignature.category.type}
            className={buildClassName('fieldset')()}
          >
            <legend>{categorizedTimeSignature.category.type}</legend>
            <div className={buildClassName('label-container')()}>
              {categorizedTimeSignature.items.map((timeSignature) => {
                return (
                  <label
                    htmlFor={timeSignature.type}
                    key={timeSignature.type}
                    className={buildClassName('label')()}
                  >
                    <input
                      type="radio"
                      id={timeSignature.type}
                      name={timeSignature.type}
                      className={buildClassName('radio-button')()}
                      checked={Boolean(
                        timeSignature.type === selectedTimeSignature.type
                      )}
                      onChange={handleTimeSignatureChange}
                    />
                    <img
                      src={timeSignature.icon}
                      alt={timeSignature.description}
                      title={timeSignature.description}
                      className={classnames(
                        buildClassName('icon')(),
                        buildClassName('icon')(timeSignature.type)
                      )}
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </section>
  );
};

export default TimeSignatureSelection;
