import React, { ReactNode, useEffect, useState } from 'react';
import { init } from '../i18n';
import Loading from './Loading';

export interface LanguageLoaderProps {
  children: ReactNode;
}

export const LanguageLoader = ({ children }: LanguageLoaderProps) => {
  const [languageLoaded, setLanguageLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await init();
      setLanguageLoaded(true);
    })();
  }, []);

  if (!languageLoaded) {
    return <Loading />;
  }

  return <>{children}</>;
};
