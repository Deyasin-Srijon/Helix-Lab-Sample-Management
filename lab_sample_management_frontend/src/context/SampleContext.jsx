import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as sampleService from '../services/sampleService';
import { useAuth } from './AuthContext';

const SampleContext = createContext(null);

export function SampleProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [samples, setSamples] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setSamples([]);
      setIsReady(true);

      return {
        success: false,
        status: 401,
        error: 'User is not authenticated',
        samples: [],
      };
    }

    const result = await sampleService.getSamples();

    if (result.success) {
      setSamples(result.samples);
    } else if (result.status === 401) {
      setSamples([]);
    }

    return result;
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    const loadSamples = async () => {
      if (!isAuthenticated) {
        if (!cancelled) {
          setSamples([]);
          setIsReady(true);
        }

        return;
      }

      if (!cancelled) {
        setIsReady(false);
      }

      try {
        const result =
          await sampleService.getSamples();

        if (cancelled) {
          return;
        }

        if (result.success) {
          setSamples(result.samples);
        } else {
          setSamples([]);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    loadSamples();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const addSample = useCallback(
    async (payload) => {
      const result =
        await sampleService.addSample(payload);

      if (result.success) {
        await refresh();
      }

      return result;
    },
    [refresh]
  );

  const updateSample = useCallback(
    async (id, payload) => {
      const result =
        await sampleService.updateSample(
          id,
          payload
        );

      if (result.success) {
        await refresh();
      }

      return result;
    },
    [refresh]
  );

  const deleteSample = useCallback(
    async (id) => {
      const result =
        await sampleService.deleteSample(id);

      if (result.success) {
        await refresh();
      }

      return result;
    },
    [refresh]
  );

  const getSampleById = useCallback(
    (id) => {
      return (
        samples.find(
          (sample) =>
            String(sample.id) === String(id)
        ) || null
      );
    },
    [samples]
  );

  const value = useMemo(
    () => ({
      samples,
      isReady,
      refresh,
      addSample,
      updateSample,
      deleteSample,
      getSampleById,
    }),
    [
      samples,
      isReady,
      refresh,
      addSample,
      updateSample,
      deleteSample,
      getSampleById,
    ]
  );

  return (
    <SampleContext.Provider value={value}>
      {children}
    </SampleContext.Provider>
  );
}

export function useSamples() {
  const context = useContext(SampleContext);

  if (!context) {
    throw new Error(
      'useSamples must be used within SampleProvider'
    );
  }

  return context;
}