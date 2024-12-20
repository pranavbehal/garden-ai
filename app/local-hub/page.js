"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Map,
  Bug,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeatherAlerts } from "@/components/dashboard/weather-alerts";
import {
  getPointData,
  getForecastData,
  getHourlyForecast,
  getAlerts,
  getLocationInfo,
  processAlerts,
} from "@/lib/weather";
import Image from "next/image";

const seasonalPlantingGuide = {
  vegetables: [
    {
      plant: "Garlic",
      bestTime: "Fall",
      harvestTime: "Summer",
    },
    {
      plant: "Spinach",
      bestTime: "Early Spring/Fall",
      harvestTime: "Spring/Fall/Winter",
    },
    {
      plant: "Kale",
      bestTime: "Early Spring/Fall",
      harvestTime: "Spring/Fall/Winter",
    },
    {
      plant: "Brussels Sprouts",
      bestTime: "Late Spring",
      harvestTime: "Fall/Winter",
    },
    {
      plant: "Winter Rye",
      bestTime: "Fall",
      harvestTime: "Spring",
    },
    {
      plant: "Turnips",
      bestTime: "Late Summer",
      harvestTime: "Fall/Winter",
    },
  ],
};

export default function LocalHubPage() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Get location info
            const locationInfo = await getLocationInfo(latitude, longitude);
            setLocation(locationInfo);

            if (locationInfo) {
              // Get forecast data
              const forecast = await getForecastData(
                locationInfo.gridId,
                locationInfo.gridX,
                locationInfo.gridY
              );
              setWeather(forecast);

              // Get alerts
              const alertsData = await getAlerts(locationInfo.forecastZone);
              const processedAlerts = processAlerts(alertsData);
              setAlerts(processedAlerts);
            }
          } catch (err) {
            setError("Failed to fetch weather data. Please try again later.");
            console.error(err);
          }
        },
        () => {
          setError(
            "Please enable location services to see weather information"
          );
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  const currentPeriod = weather?.properties?.periods?.[0];

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Local Growing Hub
          </h2>
          {location && (
            <p className="text-muted-foreground" suppressHydrationWarning>
              {location.city}, {location.state}
              <span className="text-sm ml-2" suppressHydrationWarning>
                {location.county && `(${location.county.split("/").pop()})`}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts?.length > 0 && <WeatherAlerts alerts={alerts} />}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Weather Dashboard */}
      {currentPeriod && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2 grid gap-4">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Current Weather
                </CardTitle>
                <Cloud className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-3xl font-bold" suppressHydrationWarning>
                    {currentPeriod.temperature}°{currentPeriod.temperatureUnit}
                  </p>
                  <p className="text-muted-foreground" suppressHydrationWarning>
                    {currentPeriod.shortForecast}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wind</CardTitle>
                  <Wind className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" suppressHydrationWarning>
                    {currentPeriod.windSpeed}
                  </div>
                  <p
                    className="text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    Direction: {currentPeriod.windDirection}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Forecast
                  </CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-medium">
                    {currentPeriod.name}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentPeriod.shortForecast}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Details</CardTitle>
                  <Map className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">Growing Zone Info</p>
                  <p className="text-xs text-muted-foreground">
                    {location?.timeZone}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Extended Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weather?.properties?.periods?.slice(1, 4).map((period) => (
                  <div
                    key={period.number}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium" suppressHydrationWarning>
                        {period.name}
                      </p>
                      <p
                        className="text-sm text-muted-foreground"
                        suppressHydrationWarning
                      >
                        {period.shortForecast}
                      </p>
                    </div>
                    <p className="text-right" suppressHydrationWarning>
                      {period.temperature}°{period.temperatureUnit}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Growing Information */}
      <Tabs defaultValue="seasonal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seasonal">Seasonal Guide</TabsTrigger>
          <TabsTrigger value="pests">Pests & Diseases</TabsTrigger>
          <TabsTrigger value="soil">Soil Types</TabsTrigger>
        </TabsList>

        <TabsContent value="seasonal" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Seasonal Planting Guide
                </CardTitle>
                <CardDescription>What to plant this season</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 font-medium">Plant</th>
                        <th className="text-left pb-2 font-medium">
                          Best Time to Plant
                        </th>
                        <th className="text-left pb-2 font-medium">
                          Harvest Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {seasonalPlantingGuide.vegetables.map((item) => (
                        <tr key={item.plant} className="text-muted-foreground">
                          <td className="py-3">{item.plant}</td>
                          <td className="py-3">{item.bestTime}</td>
                          <td className="py-3">{item.harvestTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                  <li>Prepare soil</li>
                  <li>Start seeds indoors</li>
                  <li>Prune perennials</li>
                  <li>Check irrigation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Local Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                  <li>
                    Use cold frames or row covers to extend growing season
                  </li>
                  <li>Plant cold-hardy varieties that can withstand frost</li>
                  <li>Consider indoor growing for herbs and microgreens</li>
                  <li>Mulch heavily to protect root vegetables</li>
                </ul>
                <Button variant="link" className="mt-4 p-0">
                  Chat with AI about local tips
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pests" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Common Local Pests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Japanese Beetles</li>
                  <li>• Tomato Hornworms</li>
                  <li>• Aphids</li>
                  <li>• Squash Bugs</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="soil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Local Soil Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your area typically has clay-loam soil. Consider adding organic
                matter to improve drainage.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
