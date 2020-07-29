import { ScoreElementDefinition } from './score';

export const widthUnitTypes = {
  SINGLE_BARLINE: 2,
  DOUBLE_BARLINE: 3,
  CLEF: 5,
  TIME_SIGNATURE: 6,
  FULL_MEASURE: 24,
  THREE_QUARTER_MEASURE: 18,
  HALF_MEASURE_DIV_3: 16,
  HALF_MEASURE_DIV_2: 14,
  HALF_MEASURE: 13,
  QUARTER_MEASURE_DIV_4: 12,
  QUARTER_MEASURE_DIV_3: 11,
  QUARTER_MEASURE_DIV_2: 10,
  QUARTER_MEASURE: 6,
};

export interface DimensionData {
  staffWidth: number;
  staffHeight: number;
  widthUnitWidth: number;
}

const MAX_STAFF_WIDTH_PIXELS = 1200;
const STAFF_MARGIN_PERCENT = 0.06;
const MEASURE_ASPECT_RATIO = 6;

export const getStaffDimensionData = (
  innerWidth: number,
  measuresPerStaff: number,
  totalWidthUnits: number
): DimensionData => {
  let staffWidth: number;

  if (innerWidth > MAX_STAFF_WIDTH_PIXELS) {
    staffWidth = MAX_STAFF_WIDTH_PIXELS;
  } else {
    staffWidth = innerWidth * STAFF_MARGIN_PERCENT;
  }

  const staffAspectRatio = 1 / (MEASURE_ASPECT_RATIO * measuresPerStaff);
  const staffHeight = staffWidth * staffAspectRatio;
  const widthUnitWidth = staffWidth / totalWidthUnits;

  return {
    staffWidth,
    staffHeight,
    widthUnitWidth,
  };
};

export const getTotalWidthUnits = (
  definitions: ScoreElementDefinition<any>[]
) => {
  return definitions.reduce((totalCount, definition) => {
    return totalCount + definition.widthUnit;
  }, 0);
};

const inPx = (value: number) => `${value}px`;

const getDimensionStyle = (width: number, height: number) => {
  return {
    width: inPx(width),
    height: inPx(height),
  };
};

export const getStaffStyle = (dimensionData: DimensionData) => {
  return getDimensionStyle(dimensionData.staffWidth, dimensionData.staffHeight);
};

export const getScoreElementStyle = (
  dimensionData: DimensionData,
  widthUnits: number
) => {
  return getDimensionStyle(
    dimensionData.widthUnitWidth * widthUnits,
    dimensionData.staffHeight
  );
};
