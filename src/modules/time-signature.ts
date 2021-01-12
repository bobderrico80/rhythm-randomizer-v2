import {
  CategorizableTypedItem,
  CategorizedItem,
  categorizeItems,
  Category,
  findItemOfType,
} from './util';

export enum TimeSignatureCategoryType {
  SIMPLE = 'Simple Meter',
  COMPOUND = 'Compound Meter',
}

export enum TimeSignatureComplexity {
  SIMPLE,
  COMPOUND,
}

export enum TimeSignatureType {
  SIMPLE_2_4 = '2/4',
  SIMPLE_3_4 = '3/4',
  SIMPLE_4_4 = '4/4',
  COMPOUND_6_8 = '6/8',
  COMPOUND_9_8 = '9/8',
  COMPOUND_12_8 = '12/8',
}

export interface TimeSignatureCategory
  extends Category<TimeSignatureCategoryType> {}

export interface CategorizedTimeSignature
  extends CategorizedItem<TimeSignatureCategory, TimeSignature> {}

export interface TimeSignature
  extends CategorizableTypedItem<TimeSignatureType, TimeSignatureCategoryType> {
  type: TimeSignatureType;
  complexity: TimeSignatureComplexity;
  categoryType: TimeSignatureCategoryType;
  beatsPerMeasure: number;
  description: string;
  icon: string;
  index: number;
}

export const timeSignatures: TimeSignature[] = [
  {
    type: TimeSignatureType.SIMPLE_2_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 2,
    description: '2/4 time signature',
    icon: require('../svg/time-signatures/ts-2-4.svg').default,
    sortOrder: 0,
    index: 0,
  },
  {
    type: TimeSignatureType.SIMPLE_3_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 3,
    description: '3/4 time signature',
    icon: require('../svg/time-signatures/ts-3-4.svg').default,
    sortOrder: 1,
    index: 1,
  },
  {
    type: TimeSignatureType.SIMPLE_4_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 4,
    description: '4/4 time signature',
    icon: require('../svg/time-signatures/ts-4-4.svg').default,
    sortOrder: 2,
    index: 2,
  },
  {
    type: TimeSignatureType.COMPOUND_6_8,
    complexity: TimeSignatureComplexity.COMPOUND,
    categoryType: TimeSignatureCategoryType.COMPOUND,
    beatsPerMeasure: 2,
    description: '6/8 time signature',
    icon: require('../svg/time-signatures/ts-6-8.svg').default,
    sortOrder: 3,
    index: 3,
  },
  {
    type: TimeSignatureType.COMPOUND_9_8,
    complexity: TimeSignatureComplexity.COMPOUND,
    categoryType: TimeSignatureCategoryType.COMPOUND,
    beatsPerMeasure: 3,
    description: '9/8 time signature',
    icon: require('../svg/time-signatures/ts-9-8.svg').default,
    sortOrder: 4,
    index: 4,
  },
  {
    type: TimeSignatureType.COMPOUND_12_8,
    complexity: TimeSignatureComplexity.COMPOUND,
    categoryType: TimeSignatureCategoryType.COMPOUND,
    beatsPerMeasure: 4,
    description: '12/8 time signature',
    icon: require('../svg/time-signatures/ts-12-8.svg').default,
    sortOrder: 5,
    index: 5,
  },
];

export const timeSignatureCategories: TimeSignatureCategory[] = [
  {
    type: TimeSignatureCategoryType.SIMPLE,
    sortOrder: 0,
  },
  {
    type: TimeSignatureCategoryType.COMPOUND,
    sortOrder: 1,
  },
];

export const getTimeSignature = (type: TimeSignatureType) => {
  return findItemOfType<TimeSignatureType, TimeSignature>(type, timeSignatures);
};

export const getTimeSignatureCategory = (
  type: TimeSignatureCategoryType
): TimeSignatureCategory => {
  return findItemOfType<TimeSignatureCategoryType, TimeSignatureCategory>(
    type,
    timeSignatureCategories
  );
};

export const categorizeTimeSignatures = (
  timeSignatures: TimeSignature[]
): CategorizedTimeSignature[] => {
  return categorizeItems<
    TimeSignatureCategoryType,
    TimeSignatureCategory,
    TimeSignature,
    CategorizedTimeSignature
  >(timeSignatures, timeSignatureCategories);
};
