import i18n from './i18next';

export const useTranslation = () => {
  return {
    t: (string: string) => string,
    i18n,
  };
};
