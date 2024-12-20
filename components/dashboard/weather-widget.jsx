import { Cloud, Droplets, Sun, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeatherWidget({ weather, conditions, location }) {
  if (!weather?.properties?.periods?.[0]) return null;

  const currentPeriod = weather.properties.periods[0];

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Weather</CardTitle>
          <Cloud className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold">
                {currentPeriod.temperature}°{currentPeriod.temperatureUnit}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentPeriod.shortForecast}
              </p>
              {location && (
                <p className="text-xs text-muted-foreground mt-1">
                  {location.city}, {location.state}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPeriod.temperature}°{currentPeriod.temperatureUnit}
            </div>
            <p
              className={`text-xs mt-2 ${
                conditions.temperature.status === "warning"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {conditions.temperature.message}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conditions.humidity.value
                ? `${conditions.humidity.value}%`
                : "N/A"}
            </div>
            <p
              className={`text-xs mt-2 ${
                conditions.humidity.status === "warning"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {conditions.humidity.message}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPeriod.windSpeed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Direction: {currentPeriod.windDirection}
            </p>
            <p
              className={`text-xs mt-2 ${
                conditions.wind.status === "warning"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {conditions.wind.message}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{currentPeriod.name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPeriod.detailedForecast}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
