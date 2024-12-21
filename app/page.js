"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { WeatherAlerts } from "@/components/dashboard/weather-alerts";
import { PlantCard } from "@/components/plants/plant-card";
import { useRouter } from "next/navigation";
import {
  getPointData,
  getForecastData,
  getHourlyForecast,
  getAlerts,
  getLocationInfo,
  getGrowingConditions,
  processAlerts,
} from "@/lib/weather";

// Mock data for plants - will be replaced with Supabase data later
const mockPlants = [
  {
    id: "1",
    name: "Tomato Plant",
    type: "Vegetable",
    health: "Good",
    healthStatus: "optimal",
    lastWatered: "2 days ago",
    image:
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=60",
    progress: "Growing well",
    nextWatering: "Tomorrow",
    issues: [],
  },
  {
    id: "2",
    name: "Basil",
    type: "Herb",
    health: "Needs Water",
    healthStatus: "warning",
    lastWatered: "5 days ago",
    image:
      "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800&auto=format&fit=crop&q=60",
    progress: "Leaves yellowing",
    nextWatering: "Today",
    issues: ["Yellowing leaves", "Dry soil"],
  },
  {
    id: "3",
    name: "Snake Plant",
    type: "Indoor",
    health: "Good",
    healthStatus: "optimal",
    lastWatered: "1 week ago",
    image:
      "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=800&auto=format&fit=crop&q=60",
    progress: "Healthy growth",
    nextWatering: "Next week",
    issues: [],
  },
];

export default function HomePage() {
  const router = useRouter();
  const [plants, setPlants] = useState(mockPlants);
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

  const handleAddPlant = () => {
    router.push("/plants/new");
  };

  // Calculate plant health statistics
  const healthStats = plants.reduce(
    (acc, plant) => {
      if (plant.healthStatus === "optimal") acc.healthy++;
      else if (plant.healthStatus === "warning") acc.needsAttention++;
      return acc;
    },
    { healthy: 0, needsAttention: 0 }
  );

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Garden</h2>
          <p className="text-muted-foreground">
            {location ? (
              <>
                {location.city}, {location.state}
                <span className="text-sm ml-2 text-muted-foreground">
                  {location.county && `(${location.county.split("/").pop()})`}
                </span>
              </>
            ) : (
              "Manage and monitor your plants' progress"
            )}
          </p>
        </div>
        <Button onClick={handleAddPlant}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Plant
        </Button>
      </div>

      {/* Plant Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Plants
          </div>
          <div className="text-2xl font-bold">{plants.length}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Healthy
          </div>
          <div className="text-2xl font-bold text-green-600">
            {healthStats.healthy}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Needs Attention
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {healthStats.needsAttention}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Next Watering
          </div>
          <div className="text-2xl font-bold">
            {plants.find((p) => p.nextWatering === "Today")
              ? "Today"
              : "Tomorrow"}
          </div>
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

      {/* Plants Grid */}
      <div>
        <h3 className="text-lg font-medium mb-4">My Plants</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              health={plant.healthStatus}
            />
          ))}
          {plants.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t added any plants yet
              </p>
              <Button onClick={handleAddPlant}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Plant
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Weather Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Weather & Growing Conditions</h3>
        <div className="grid gap-4">
          {weather && conditions && (
            <WeatherWidget
              weather={weather}
              conditions={conditions}
              location={location}
            />
          )}
        </div>
      </div>
    </div>
  );
}
