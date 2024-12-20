"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Camera, History, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { WeatherAlerts } from "@/components/dashboard/weather-alerts";
import {
  getPointData,
  getForecastData,
  getHourlyForecast,
  getAlerts,
  getLocationInfo,
  getGrowingConditions,
  processAlerts,
} from "@/lib/weather";
import Image from "next/image";

// Mock data for plants - will be replaced with Supabase data later
const mockPlants = [
  {
    id: 1,
    name: "Tomato Plant",
    type: "Vegetable",
    health: "Good",
    lastWatered: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=60",
    progress: "Growing well",
  },
  {
    id: 2,
    name: "Basil",
    type: "Herb",
    health: "Needs Water",
    lastWatered: "5 days ago",
    image:
      "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800&auto=format&fit=crop&q=60",
    progress: "Leaves yellowing",
  },
  {
    id: 3,
    name: "Snake Plant",
    type: "Indoor",
    health: "Good",
    lastWatered: "1 week ago",
    image:
      "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=800&auto=format&fit=crop&q=60",
    progress: "Healthy growth",
  },
];

function PlantCard({ plant }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full relative">
        <Image
          src={plant.image}
          alt={plant.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{plant.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{plant.type}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              plant.health === "Good"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {plant.health}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Watered:</span>
            <span>{plant.lastWatered}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Photo
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <History className="mr-2 h-4 w-4" />
              Timeline
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [conditions, setConditions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Get location info first
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

              // Get hourly forecast for detailed conditions
              const hourlyForecast = await getHourlyForecast(
                locationInfo.gridId,
                locationInfo.gridX,
                locationInfo.gridY
              );

              // Get any active alerts
              const alertsData = await getAlerts(locationInfo.forecastZone);
              const processedAlerts = processAlerts(alertsData);
              setAlerts(processedAlerts);

              // Process growing conditions
              const growingConditions = getGrowingConditions(hourlyForecast);
              setConditions(growingConditions);
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

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Garden</h1>
          <p className="text-muted-foreground">
            {location ? (
              <>
                {location.city}, {location.state}
                <span className="text-sm ml-2 text-muted-foreground">
                  {location.county && `(${location.county.split("/").pop()})`}
                </span>
              </>
            ) : (
              "Manage and monitor your plants"
            )}
          </p>
        </div>
        <Button asChild>
          <a href="/plants/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Plant
          </a>
        </Button>
      </div>

      {/* Weather Alerts */}
      {alerts?.length > 0 && <WeatherAlerts alerts={alerts} />}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Plants Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Plants</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      {weather && conditions && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Local Weather</h2>
          <WeatherWidget
            weather={weather}
            conditions={conditions}
            location={location}
          />
        </div>
      )}
    </div>
  );
}
