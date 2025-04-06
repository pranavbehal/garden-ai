"use client";

import { cn } from "@/lib/utils";
import { type WeatherData } from "@/app/api/weather/service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cloud,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  CloudRain,
  AlertTriangle,
  Sprout,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeatherWidgetProps {
  weather: WeatherData;
  className?: string;
}

export function WeatherWidget({ weather, className }: WeatherWidgetProps) {
  if (!weather) {
    return null;
  }

  return (
    <div className={cn("grid gap-4", className)}>
      {/* Current Weather */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weather.current?.temperature}°F
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Feels like {weather.current?.feelsLike}°F
            </p>
            <p className="text-xs text-muted-foreground">
              {weather.current?.conditions}
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
              {weather.current?.humidity}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dew point: {weather.current?.dewPoint}°F
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weather.current?.windSpeed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Direction: {weather.current?.windDirection}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UV Index</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weather.current?.uv}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visibility: {weather.current?.visibility}km
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Forecast */}
      {weather.hourly && weather.hourly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hourly Forecast</CardTitle>
            <CardDescription>Next 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-4 p-4">
                {weather.hourly.map((hour: any, index: any) => (
                  <TooltipProvider key={`${hour.time}-${index}`}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex flex-col items-center space-y-2">
                          <span className="text-sm font-medium">
                            {hour.time}
                          </span>
                          <img
                            src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`}
                            alt={hour.conditions}
                            className="h-10 w-10"
                          />
                          <span className="text-sm">{hour.temperature}°F</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p>{hour.conditions}</p>
                          <p>Humidity: {hour.humidity}%</p>
                          {hour.precipitation > 0 && (
                            <p>Precipitation: {hour.precipitation}mm</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Gardening Conditions */}
      {weather.gardening && (
        <Card>
          <CardHeader>
            <CardTitle>Gardening Conditions</CardTitle>
            <CardDescription>Tips for your garden</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-4">
                  <Sprout
                    className={cn(
                      "h-6 w-6",
                      weather.gardening.isGoodForPlanting
                        ? "text-green-500"
                        : "text-yellow-500"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">Planting Conditions</p>
                    <p className="text-sm text-muted-foreground">
                      {weather.gardening.isGoodForPlanting
                        ? "Good for planting"
                        : "Not ideal for planting"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <CloudRain
                    className={cn(
                      "h-6 w-6",
                      weather.gardening.isGoodForWatering
                        ? "text-green-500"
                        : "text-yellow-500"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">Watering Conditions</p>
                    <p className="text-sm text-muted-foreground">
                      {weather.gardening.isGoodForWatering
                        ? "Good time to water"
                        : "Hold off on watering"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Soil Conditions</p>
                <p className="text-sm text-muted-foreground">
                  {weather.gardening.soilConditions}
                </p>
              </div>

              {weather.gardening.tips && weather.gardening.tips.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Gardening Tips</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {weather.gardening.tips.map((tip: any, index: any) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Alerts */}
      {weather.alerts && weather.alerts.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Weather Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weather.alerts.map((alert, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-medium">{alert.event}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alert.start} - {alert.end}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
