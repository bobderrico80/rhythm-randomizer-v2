import React, { useContext } from 'react';
import classnames from 'classnames';
import {
  categorizeTimeSignatures,
  getTimeSignature,
  TimeSignature,
  TimeSignatureType,
} from '../modules/time-signature';
import { buildBemClassName } from '../modules/util';
import './TimeSignatureSelection.scss';
import { AppContext } from '../App';
import { createDispatchUpdateScoreSettings } from '../modules/reducer';

export interface TimeSignatureSelectionProps {
  timeSignatures: TimeSignature[];
}

const buildClassName = buildBemClassName('c-rr-time-signature-selection');

const TimeSignatureSelection = ({
  timeSignatures,
}: TimeSignatureSelectionProps) => {
  const { state, dispatch } = useContext(AppContext);
  const { timeSignature } = state.scoreSettings;
  const dispatchUpdateScoreSettings = createDispatchUpdateScoreSettings(
    dispatch
  );

  const handleTimeSignatureChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    dispatchUpdateScoreSettings({
      timeSignature: getTimeSignature(
        event.currentTarget.name as TimeSignatureType
      ),
    });
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
              {categorizedTimeSignature.items.map((ts) => {
                return (
                  <label
                    htmlFor={ts.type}
                    key={ts.type}
                    className={buildClassName('label')()}
                  >
                    <input
                      type="radio"
                      id={ts.type}
                      name={ts.type}
                      className={buildClassName('radio-button')()}
                      checked={Boolean(ts.type === timeSignature.type)}
                      onChange={handleTimeSignatureChange}
                    />
                    <img
                      src={ts.icon}
                      alt={ts.description}
                      title={ts.description}
                      className={classnames(
                        buildClassName('icon')(),
                        buildClassName('icon')(ts.type)
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
