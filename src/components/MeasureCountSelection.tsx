import React, { FormEvent } from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './MeasureCountSelection.scss';

export interface MeasureCountSelectionProps {
  measureCountOptions: number[];
  selectedMeasureCount: number;
  onMeasureCountChange: (measureCount: number) => void;
}

const buildClassName = buildBemClassName('c-rr-measure-count-selection');

const MeasureCountSelection = ({
  measureCountOptions,
  selectedMeasureCount,
  onMeasureCountChange,
}: MeasureCountSelectionProps) => {
  const handleMeasureCountChange = (event: FormEvent<HTMLSelectElement>) => {
    onMeasureCountChange(parseInt(event.currentTarget.value, 10));
  };

  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <h3 className="c-rr-settings-form__section-title">
        Measure Count Selection
      </h3>
      <fieldset className={buildClassName('fieldset')()}>
        <label htmlFor="measure-count" className={buildClassName('label')()}>
          Total measures:
          <select
            id="measure-count"
            className={buildClassName('dropdown')()}
            onChange={handleMeasureCountChange}
            value={selectedMeasureCount}
          >
            {measureCountOptions.map((measureCountOption) => {
              return (
                <option value={measureCountOption} key={measureCountOption}>
                  {`${measureCountOption} measure${
                    measureCountOption > 1 ? 's' : ''
                  }`}
                </option>
              );
            })}
          </select>
        </label>
      </fieldset>
    </section>
  );
};

export default MeasureCountSelection;
