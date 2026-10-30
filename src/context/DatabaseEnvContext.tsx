import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseEnv } from '../types';

interface DatabaseEnvContextType {
  env: DatabaseEnv;
  setEnv: (env: DatabaseEnv) => void;
  isLive: boolean;
  toggleEnv: () => void;
}

const DatabaseEnvContext = createContext<DatabaseEnvContextType>({
  env: 'live',
  setEnv: () => {},
  isLive: true,
  toggleEnv: () => {},
});

export const DatabaseEnvProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [env, setEnvState] = useState<DatabaseEnv>(() => {
    const saved = localStorage.getItem('bais_bp2026_env');
    return (saved === 'practice' || saved === 'live') ? saved : 'live';
  });

  const setEnv = (newEnv: DatabaseEnv) => {
    setEnvState(newEnv);
    localStorage.setItem('bais_bp2026_env', newEnv);
  };

  const toggleEnv = () => {
    setEnv(env === 'live' ? 'practice' : 'live');
  };

  return (
    <DatabaseEnvContext.Provider value={{ env, setEnv, isLive: env === 'live', toggleEnv }}>
      {children}
    </DatabaseEnvContext.Provider>
  );
};

export const useDatabaseEnv = () => useContext(DatabaseEnvContext);
