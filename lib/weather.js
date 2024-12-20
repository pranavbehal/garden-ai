// Weather service utilities using National Weather Service API
export async function getWeatherData(lat, lon) {
  try {
    // First, get the grid coordinates from lat/lon
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${lat},${lon}`
    );
    const pointData = await pointResponse.json();

    // Get the forecast using the grid endpoint
    const forecastResponse = await fetch(pointData.properties.forecast);
    const forecastData = await forecastResponse.json();

    // Get current conditions from the nearest station
    const stationsResponse = await fetch(
      pointData.properties.observationStations
    );
    const stationsData = await stationsResponse.json();
    const nearestStation = stationsData.features[0];

    const observationsResponse = await fetch(
      `${nearestStation.id}/observations/latest`
    );
    const observationData = await observationsResponse.json();

    return {
      current: observationData.properties,
      forecast: forecastData.properties.periods[0],
      location: pointData.properties,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

export function getWeatherAlerts(weather) {
  const alerts = [];
  const temp = weather?.current?.temperature?.value;
  const conditions = weather?.forecast?.shortForecast?.toLowerCase();

  // Convert from Celsius to Fahrenheit
  const tempF = temp ? (temp * 9) / 5 + 32 : null;

  if (tempF && tempF <= 32) {
    alerts.push({
      type: "frost",
      severity: "high",
      message:
        "Frost warning: Protect sensitive plants from freezing temperatures.",
    });
  }

  if (tempF && tempF >= 90) {
    alerts.push({
      type: "heat",
      severity: "high",
      message:
        "Heat warning: Water plants more frequently and provide shade if possible.",
    });
  }

  if (conditions?.includes("rain") || conditions?.includes("storm")) {
    alerts.push({
      type: "rain",
      severity: "medium",
      message:
        "Heavy rain expected: Check drainage and protect delicate plants.",
    });
  }

  return alerts;
}

// Combined and improved getGrowingConditions function
export function getGrowingConditions(weatherData) {
  // Handle both forecast and current observation data formats
  const currentPeriod = weatherData?.properties?.periods?.[0];
  const currentObs = weatherData?.current;

  // If we have forecast data
  if (currentPeriod) {
    const temp = currentPeriod.temperature;
    const humidity = currentPeriod?.relativeHumidity?.value || null;
    const windSpeed = parseInt(currentPeriod.windSpeed) || 0;
    const isDaytime = currentPeriod.isDaytime;

    return {
      temperature: {
        value: temp,
        status: getTempStatus(temp),
        message: getTempMessage(temp),
      },
      humidity: {
        value: humidity,
        status: getHumidityStatus(humidity),
        message: getHumidityMessage(humidity),
      },
      sunlight: {
        value: isDaytime ? 100 : 0,
        status: isDaytime ? "optimal" : "warning",
        message: isDaytime ? "Good light conditions" : "Night time",
      },
      wind: {
        value: windSpeed,
        status: getWindStatus(windSpeed),
        message: getWindMessage(windSpeed),
      },
    };
  }

  // If we have current observation data
  if (currentObs) {
    const temp = currentObs?.temperature?.value;
    const humidity = currentObs?.relativeHumidity?.value;
    const windSpeed = currentObs?.windSpeed?.value;
    const cloudCover = currentObs?.cloudLayers?.[0]?.amount || "CLR";

    // Convert metrics
    const tempF = temp ? (temp * 9) / 5 + 32 : null;
    const windSpeedMph = windSpeed ? windSpeed * 2.237 : null;
    const cloudPercent =
      cloudCover === "CLR"
        ? 0
        : cloudCover === "FEW"
        ? 25
        : cloudCover === "SCT"
        ? 50
        : cloudCover === "BKN"
        ? 75
        : 100;

    return {
      temperature: {
        value: Math.round(tempF),
        status: getTempStatus(tempF),
        message: getTempMessage(tempF),
      },
      humidity: {
        value: Math.round(humidity),
        status: getHumidityStatus(humidity),
        message: getHumidityMessage(humidity),
      },
      sunlight: {
        value: 100 - cloudPercent,
        status: getSunlightStatus(cloudPercent),
        message: getSunlightMessage(cloudPercent),
      },
      wind: {
        value: Math.round(windSpeedMph),
        status: getWindStatus(windSpeedMph),
        message: getWindMessage(windSpeedMph),
      },
    };
  }

  // If neither format is available
  return null;
}

// Helper functions for condition messages
function getTempStatus(temp) {
  if (!temp) return "unknown";
  return temp < 40 || temp > 85 ? "warning" : "optimal";
}

function getTempMessage(temp) {
  if (!temp) return "Temperature data unavailable";
  if (temp < 40) return "Too cold for most plants";
  if (temp > 85) return "Too hot for some plants";
  return "Temperature is ideal for most plants";
}

function getHumidityStatus(humidity) {
  if (!humidity) return "unknown";
  return humidity < 30 || humidity > 80 ? "warning" : "optimal";
}

function getHumidityMessage(humidity) {
  if (!humidity) return "Humidity data unavailable";
  if (humidity < 30) return "Low humidity - consider misting plants";
  if (humidity > 80) return "High humidity - watch for fungal issues";
  return "Humidity levels are good";
}

function getSunlightStatus(cloudCover) {
  return cloudCover > 80 ? "warning" : "optimal";
}

function getSunlightMessage(cloudCover) {
  if (cloudCover > 80) return "Overcast - low light conditions";
  return "Good light conditions";
}

function getWindStatus(windSpeed) {
  if (!windSpeed) return "unknown";
  return windSpeed > 15 ? "warning" : "optimal";
}

function getWindMessage(windSpeed) {
  if (!windSpeed) return "Wind data unavailable";
  if (windSpeed > 15) return "Strong winds - protect delicate plants";
  return "Calm conditions";
}

// Get location data from coordinates
export async function getLocationData(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
  );
  return response.json();
}

// Get point data from coordinates
export async function getPointData(lat, lon) {
  const response = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
  return response.json();
}

// Get forecast data using office and grid points
export async function getForecastData(office, gridX, gridY) {
  const response = await fetch(
    `https://api.weather.gov/gridpoints/${office}/${gridX},${gridY}/forecast`
  );
  return response.json();
}

// Get hourly forecast data
export async function getHourlyForecast(office, gridX, gridY) {
  const response = await fetch(
    `https://api.weather.gov/gridpoints/${office}/${gridX},${gridY}/forecast/hourly`
  );
  return response.json();
}

// Get active alerts for a zone
export async function getAlerts(zoneId) {
  const response = await fetch(
    `https://api.weather.gov/alerts/active/zone/${zoneId}`
  );
  return response.json();
}

// Get location info from coordinates using reverse geocoding
export async function getLocationInfo(lat, lon) {
  try {
    const response = await fetch(
      `https://api.weather.gov/points/${lat},${lon}`
    );
    const data = await response.json();

    return {
      city: data.properties.relativeLocation.properties.city,
      state: data.properties.relativeLocation.properties.state,
      gridId: data.properties.gridId,
      gridX: data.properties.gridX,
      gridY: data.properties.gridY,
      forecastZone: data.properties.forecastZone.split("/").pop(),
      county: data.properties.county,
      timeZone: data.properties.timeZone,
    };
  } catch (error) {
    console.error("Error getting location info:", error);
    return null;
  }
}

// Process alerts for plant care
export function processAlerts(alerts) {
  if (!alerts?.features?.length) return [];

  return alerts.features.map((alert) => {
    const { event, headline, description, severity } = alert.properties;

    // Determine alert type based on event
    let type = "general";
    if (
      event.toLowerCase().includes("frost") ||
      event.toLowerCase().includes("freeze")
    ) {
      type = "frost";
    } else if (event.toLowerCase().includes("heat")) {
      type = "heat";
    } else if (
      event.toLowerCase().includes("rain") ||
      event.toLowerCase().includes("storm")
    ) {
      type = "rain";
    }

    return {
      type,
      severity: severity.toLowerCase(),
      title: headline,
      message: description,
    };
  });
}
