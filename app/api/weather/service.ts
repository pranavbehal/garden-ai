import { createClient } from "@/lib/client";

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/3.0";

export interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: string;
    windDirection: string;
    conditions: string;
    icon: string;
    uv: number;
    visibility: number;
    pressure: number;
    dewPoint: number;
    precipitation: number;
  };
  forecast: {
    date: string;
    temperature: {
      min: number;
      max: number;
      day: number;
      night: number;
      evening: number;
      morning: number;
    };
    humidity: number;
    conditions: string;
    icon: string;
    precipitation: number;
    windSpeed: string;
    summary: string;
  }[];
  hourly: {
    time: string;
    temperature: number;
    precipitation: number;
    humidity: number;
    conditions: string;
    icon: string;
    precipitationProbability: number;
  }[];
  alerts: {
    event: string;
    description: string;
    start: string;
    end: string;
    sender: string;
  }[];
  gardening: {
    isGoodForWatering: boolean;
    isGoodForPlanting: boolean;
    soilConditions: string;
    tips: string[];
  };
}

export async function getWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  try {
    // Get current weather, hourly forecast, and daily forecast
    const oneCallResponse = await fetch(
      `${BASE_URL}/onecall?lat=${latitude}&lon=${longitude}&units=imperial&appid=${OPENWEATHER_API_KEY}&exclude=minutely`
    );

    if (!oneCallResponse.ok) {
      throw new Error(`Weather API error: ${oneCallResponse.statusText}`);
    }

    const oneCallData = await oneCallResponse.json();

    const pollutionResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`
    );

    if (!pollutionResponse.ok) {
      throw new Error(
        `Air pollution API error: ${pollutionResponse.statusText}`
      );
    }

    const pollutionData = await pollutionResponse.json();

    const current = oneCallData.current || {};
    const hourly = oneCallData.hourly || [];
    const daily = oneCallData.daily || [];
    const aqi = pollutionData.list?.[0]?.main?.aqi || 1;

    const gardeningConditions = calculateGardeningConditions(
      current,
      hourly[0] || {},
      daily[0] || {},
      aqi
    );

    const processedData: WeatherData = {
      current: {
        temperature: Math.round(current.temp || 0),
        feelsLike: Math.round(current.feels_like || 0),
        humidity: current.humidity || 0,
        windSpeed: `${Math.round(current.wind_speed || 0)} mph`,
        windDirection: getWindDirection(current.wind_deg || 0),
        conditions: current.weather?.[0]?.main || "Unknown",
        icon: current.weather?.[0]?.icon || "01d",
        uv: current.uvi || 0,
        visibility: (current.visibility || 0) / 1000,
        pressure: current.pressure || 0,
        dewPoint: Math.round(current.dew_point || 0),
        precipitation: current.rain?.["1h"] || current.snow?.["1h"] || 0,
      },
      forecast: (daily || []).map((day: any) => ({
        date: new Date(day.dt * 1000).toLocaleDateString(),
        temperature: {
          min: Math.round(day.temp?.min || 0),
          max: Math.round(day.temp?.max || 0),
          day: Math.round(day.temp?.day || 0),
          night: Math.round(day.temp?.night || 0),
          evening: Math.round(day.temp?.eve || 0),
          morning: Math.round(day.temp?.morn || 0),
        },
        humidity: day.humidity || 0,
        conditions: day.weather?.[0]?.main || "Unknown",
        icon: day.weather?.[0]?.icon || "01d",
        precipitation: day.rain || day.snow || 0,
        windSpeed: `${Math.round(day.wind_speed || 0)} mph`,
        summary: day.summary || "",
      })),
      hourly: (hourly || []).slice(0, 24).map((hour: any) => ({
        time: new Date(hour.dt * 1000).toLocaleTimeString([], {
          hour: "numeric",
          hour12: true,
        }),
        temperature: Math.round(hour.temp || 0),
        precipitation: hour.rain?.["1h"] || hour.snow?.["1h"] || 0,
        humidity: hour.humidity || 0,
        conditions: hour.weather?.[0]?.main || "Unknown",
        icon: hour.weather?.[0]?.icon || "01d",
        precipitationProbability: hour.pop || 0,
      })),
      alerts: (oneCallData.alerts || []).map((alert: any) => ({
        event: alert.event || "Weather Alert",
        description: alert.description || "",
        start: new Date(alert.start * 1000).toLocaleString(),
        end: new Date(alert.end * 1000).toLocaleString(),
        sender: alert.sender_name || "Weather Service",
      })),
      gardening: gardeningConditions,
    };

    return processedData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      current: {
        temperature: 0,
        feelsLike: 0,
        humidity: 0,
        windSpeed: "0 mph",
        windDirection: "N",
        conditions: "Unknown",
        icon: "01d",
        uv: 0,
        visibility: 0,
        pressure: 0,
        dewPoint: 0,
        precipitation: 0,
      },
      forecast: [],
      hourly: [],
      alerts: [],
      gardening: {
        isGoodForWatering: false,
        isGoodForPlanting: false,
        soilConditions: "Unknown",
        tips: ["Weather data unavailable"],
      },
    };
  }
}

function getWindDirection(degrees: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function calculateGardeningConditions(
  current: any,
  nextHour: any,
  today: any,
  aqi: number
): WeatherData["gardening"] {
  const tips: string[] = [];
  let isGoodForWatering = true;
  let isGoodForPlanting = true;
  let soilConditions = "Good";

  if (current.temp > 85) {
    tips.push("Water early morning or evening to prevent evaporation");
    isGoodForWatering = false;
  }

  if (current.temp < 40) {
    tips.push("Protect sensitive plants from frost");
    isGoodForPlanting = false;
  }

  if (nextHour.pop > 0.5) {
    tips.push("Rain expected soon, hold off on watering");
    isGoodForWatering = false;
  }

  if (current.wind_speed > 15) {
    tips.push("High winds may damage new plantings");
    isGoodForPlanting = false;
  }

  if (current.uvi > 8) {
    tips.push("High UV levels - provide shade for sensitive plants");
  }

  if (aqi > 3) {
    tips.push("Poor air quality may affect plant growth");
  }

  if (current.humidity > 80) {
    tips.push("High humidity - watch for fungal diseases");
    soilConditions = "Moist";
  } else if (current.humidity < 30) {
    tips.push("Low humidity - consider misting sensitive plants");
  }

  if (today.pop > 0.7) {
    tips.push("High chance of rain today");
    isGoodForWatering = false;
  }

  return {
    isGoodForWatering,
    isGoodForPlanting,
    soilConditions,
    tips: tips.length > 0 ? tips : ["Conditions are good for gardening"],
  };
}
