import { useState, useEffect } from "react";
import { WeatherData } from "@/app/api/weather/service";

interface UseWeatherOptions {
  refreshInterval?: number; // in milliseconds
}

export function useWeather(
  latitude: number | null,
  longitude: number | null,
  options: UseWeatherOptions = {}
) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { refreshInterval = 300000 } = options;

  useEffect(() => {
    if (!latitude || !longitude) {
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    async function fetchWeather() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/weather?lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const weatherData = await response.json();

        if (isMounted) {
          setData(weatherData);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setIsLoading(false);
        }
      }
    }

    function scheduleNextFetch() {
      timeoutId = setTimeout(() => {
        fetchWeather().then(() => {
          if (isMounted) {
            scheduleNextFetch();
          }
        });
      }, refreshInterval);
    }

    fetchWeather().then(() => {
      if (isMounted) {
        scheduleNextFetch();
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [latitude, longitude, refreshInterval]);

  return {
    weather: data,
    error,
    isLoading,
    refetch: async () => {
      if (!latitude || !longitude) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/weather?lat=${latitude}&lon=${longitude}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const weatherData = await response.json();
        setData(weatherData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    },
  };
}
