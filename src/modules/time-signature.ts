import {
  CategorizableTypedItem,
  CategorizedItem,
  categorizeItems,
  Category,
  findItemOfType,
} from './util';

export enum TimeSignatureCategoryType {
  SIMPLE = 'simpleMeter',
  COMPOUND = 'compoundMeter',
  ALLA_BREVE = 'allaBreveMeter',
}

export enum TimeSignatureComplexity {
  SIMPLE,
  COMPOUND,
  ALLA_BREVE,
}

export enum TimeSignatureType {
  SIMPLE_2_4 = '2/4',
  SIMPLE_3_4 = '3/4',
  SIMPLE_4_4 = '4/4',
  SIMPLE_COMMON = 'C',
  SIMPLE_5_4 = '5/4',
  SIMPLE_6_4 = '6/4',
  SIMPLE_7_4 = '7/4',
  COMPOUND_6_8 = '6/8',
  COMPOUND_9_8 = '9/8',
  COMPOUND_12_8 = '12/8',
  ALLA_BREVE_2_2 = '2/2',
  ALLA_BREVE_3_2 = '3/2',
  ALLA_BREVE_4_2 = '4/2',
  ALLA_BREVE_CUT = 'C|',
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
    description: '24TimeSignature',
    icon: require('../svg/time-signatures/ts-2-4.svg').default,
    sortOrder: 0,
    index: 0,
  },
  {
    type: TimeSignatureType.SIMPLE_3_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 3,
    description: '34TimeSignature',
    icon: require('../svg/time-signatures/ts-3-4.svg').default,
    sortOrder: 1,
    index: 1,
  },
  {
    type: TimeSignatureType.SIMPLE_4_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 4,
    description: '44TimeSignature',
    icon: require('../svg/time-signatures/ts-4-4.svg').default,
    sortOrder: 2,
    index: 2,
  },
  {
    type: TimeSignatureType.COMPOUND_6_8,
    complexity: TimeSignatureComplexity.COMPOUND,
    categoryType: TimeSignatureCategoryType.COMPOUND,
    beatsPerMeasure: 2,
    description: '68TimeSignature',
    icon: require('../svg/time-signatures/ts-6-8.svg').default,
    sortOrder: 11,
    index: 3,
  },
  {
    type: TimeSignatureType.COMPOUND_9_8,
    complexity: TimeSignatureComplexity.COMPOUND,
    categoryType: TimeSignatureCategoryType.COMPOUND,
    beatsPerMeasure: 3,
    description: '98TimeSignature',
    icon: require('../svg/time-signatures/ts-9-8.svg').default,
    sortOrder: 12,
    index: 4,
  },
  {
    type: TimeSignatureType.COMPOUND_12_8,
    complexity: TimeSignatureComplexity.COMPOUND,
    categoryType: TimeSignatureCategoryType.COMPOUND,
    beatsPerMeasure: 4,
    description: '128TimeSignature',
    icon: require('../svg/time-signatures/ts-12-8.svg').default,
    sortOrder: 13,
    index: 5,
  },
  {
    type: TimeSignatureType.SIMPLE_COMMON,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 4,
    description: 'commonTimeSignature',
    icon: require('../svg/time-signatures/ts-common.svg').default,
    sortOrder: 3,
    index: 6,
  },
  {
    type: TimeSignatureType.SIMPLE_5_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 5,
    description: '54TimeSignature',
    icon: require('../svg/time-signatures/ts-5-4.svg').default,
    sortOrder: 4,
    index: 7,
  },
  {
    type: TimeSignatureType.SIMPLE_6_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 6,
    description: '64TimeSignature',
    icon: require('../svg/time-signatures/ts-6-4.svg').default,
    sortOrder: 5,
    index: 8,
  },
  {
    type: TimeSignatureType.SIMPLE_7_4,
    complexity: TimeSignatureComplexity.SIMPLE,
    categoryType: TimeSignatureCategoryType.SIMPLE,
    beatsPerMeasure: 7,
    description: '74TimeSignature',
    icon: require('../svg/time-signatures/ts-7-4.svg').default,
    sortOrder: 6,
    index: 9,
  },
  {
    type: TimeSignatureType.ALLA_BREVE_2_2,
    complexity: TimeSignatureComplexity.ALLA_BREVE,
    categoryType: TimeSignatureCategoryType.ALLA_BREVE,
    beatsPerMeasure: 4,
    description: '22TimeSignature',
    icon: require('../svg/time-signatures/ts-2-2.svg').default,
    sortOrder: 7,
    index: 10,
  },
  {
    type: TimeSignatureType.ALLA_BREVE_3_2,
    complexity: TimeSignatureComplexity.ALLA_BREVE,
    categoryType: TimeSignatureCategoryType.ALLA_BREVE,
    beatsPerMeasure: 6,
    description: '32TimeSignature',
    icon: require('../svg/time-signatures/ts-3-2.svg').default,
    sortOrder: 8,
    index: 11,
  },
  {
    type: TimeSignatureType.ALLA_BREVE_4_2,
    complexity: TimeSignatureComplexity.ALLA_BREVE,
    categoryType: TimeSignatureCategoryType.ALLA_BREVE,
    beatsPerMeasure: 8,
    description: '42TimeSignature',
    icon: require('../svg/time-signatures/ts-4-2.svg').default,
    sortOrder: 9,
    index: 12,
  },
  {
    type: TimeSignatureType.ALLA_BREVE_CUT,
    complexity: TimeSignatureComplexity.ALLA_BREVE,
    categoryType: TimeSignatureCategoryType.ALLA_BREVE,
    beatsPerMeasure: 4,
    description: 'cutTimeSignature',
    icon: require('../svg/time-signatures/ts-cut.svg').default,
    sortOrder: 10,
    index: 13,
  },
];

export const timeSignatureCategories: TimeSignatureCategory[] = [
  {
    type: TimeSignatureCategoryType.SIMPLE,
    sortOrder: 0,
  },
  {
    type: TimeSignatureCategoryType.ALLA_BREVE,
    sortOrder: 1,
  },
  {
    type: TimeSignatureCategoryType.COMPOUND,
    sortOrder: 2,
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
