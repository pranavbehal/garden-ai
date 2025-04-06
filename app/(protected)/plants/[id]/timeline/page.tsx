"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Plant } from "@/hooks/use-plants";
import { createClient } from "@/lib/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Droplets } from "lucide-react";

const supabase = createClient();

interface TimelinePhoto {
  id: string;
  url: string;
  created_at: string;
}

export default function TimelinePage() {
  const params = useParams();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [photos, setPhotos] = useState<TimelinePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlantAndPhotos() {
      try {
        // Load plant details
        const { data: plantData, error: plantError } = await supabase
          .from("plants")
          .select("*")
          .eq("id", params.id)
          .single();

        if (plantError) throw plantError;
        setPlant(plantData);

        // Load timeline photos
        const { data: photoData, error: photoError } = await supabase
          .from("plant_photos")
          .select("*")
          .eq("plant_id", params.id)
          .order("created_at", { ascending: false });

        if (photoError) throw photoError;
        setPhotos(photoData || []);
      } catch (error) {
        console.error("Error loading plant data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPlantAndPhotos();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!plant) {
    return <div>Plant not found</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-start gap-6">
        <div className="w-1/3">
          <Card className="p-6">
            <div className="aspect-square relative mb-4">
              {plant.image_url ? (
                <img
                  src={plant.image_url}
                  alt={plant.name}
                  className="object-cover w-full h-full rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-4">{plant.name}</h1>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{plant.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Health Status</span>
                <Badge
                  variant={
                    plant.health_status === "optimal"
                      ? "default"
                      : plant.health_status === "warning"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {plant.health_status}
                </Badge>
              </div>
              {plant.last_watered && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Watered</span>
                  <span className="font-medium">
                    {format(new Date(plant.last_watered), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {plant.next_watering && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next Watering</span>
                  <span className="font-medium">
                    {format(new Date(plant.next_watering), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {plant.notes && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-muted-foreground">{plant.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Progress Photos</h2>
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={photo.url}
                    alt={`Progress photo from ${format(
                      new Date(photo.created_at),
                      "MMM d, yyyy"
                    )}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(photo.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </Card>
            ))}
            {photos.length === 0 && (
              <p className="col-span-2 text-center py-12 text-muted-foreground">
                No progress photos yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
