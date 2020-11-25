import React from 'react';
import classnames from 'classnames';
import { buildBemClassName } from '../modules/util';
import './MeasureCountSelection.scss';
import Select from './Select';

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
  const handleMeasureCountChange = (measureCount: string) => {
    onMeasureCountChange(parseInt(measureCount, 10));
  };

  return (
    <section
      className={classnames('c-rr-settings-form__section', buildClassName()())}
    >
      <fieldset className={buildClassName('fieldset')()}>
        <Select
          id="measure-count"
          label="Total measures:"
          value={selectedMeasureCount.toString()}
          onChange={handleMeasureCountChange}
          options={measureCountOptions.map((measureCountOption) => ({
            value: measureCountOption.toString(),
            display: `${measureCountOption} measure${
              measureCountOption > 1 ? 's' : ''
            }`,
          }))}
        />
      </fieldset>
    </section>
  );
};

export default MeasureCountSelection;
