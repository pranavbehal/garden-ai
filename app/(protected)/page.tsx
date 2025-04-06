"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePlants } from "@/hooks/use-plants";
import { useWeather } from "@/hooks/use-weather";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { PlantCard } from "@/components/plants/plant-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sprout, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Location {
  city: string;
  state: string;
  county?: string;
  latitude: number;
  longitude: number;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { plants, isLoading: plantsLoading } = usePlants();
  const [location, setLocation] = useState<Location | null>(null);

  // Show success toast when account is created
  useEffect(() => {
    if (searchParams?.get("accountCreated") === "true") {
      toast.success("Account created successfully! Welcome to Garden AI.");
    }
  }, [searchParams]);

  // Get user's location for weather data
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setLocation({
              city: data.city,
              state: data.principalSubdivision,
              county: data.locality,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          } catch (error) {
            console.error("Error getting location details:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const { weather, isLoading: weatherLoading } = useWeather(
    location?.latitude ?? null,
    location?.longitude ?? null,
    { refreshInterval: 300000 }
  );

  const stats = {
    total: plants.length,
    healthy: plants.filter((p) => p.health_status === "optimal").length,
    needsAttention: plants.filter((p) => p.health_status === "warning").length,
    wateringToday: plants.filter((p) => {
      if (!p.next_watering) return false;
      const nextWatering = new Date(p.next_watering);
      const today = new Date();
      return nextWatering.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <div className="container space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Garden</h1>
          <p className="text-muted-foreground">
            Monitor and manage your plants&apos; health
          </p>
        </div>
        <Button onClick={() => router.push("/plants/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Plant
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.healthy}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Needs Attention
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.needsAttention}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Watering</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.wateringToday > 0 ? "Today" : "None"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plants Grid */}
      <div className="grid grid-cols-4 gap-4">
        {plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>

      {/* Weather widget */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Weather & Growing Conditions</h3>
        <div className="grid gap-4">
          {weatherLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : weather ? (
            <WeatherWidget weather={weather} className="w-full" />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Unable to load weather data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
