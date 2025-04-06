import { format, formatDistanceToNow, addDays } from "date-fns";
import {
  Calendar,
  Droplets,
  Camera,
  History,
  MessageSquare,
  X,
} from "lucide-react";
import { Plant } from "@/hooks/use-plants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const supabase = createClient();

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [latestPhoto, setLatestPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPhoto = async () => {
      const { data, error } = await supabase
        .from("plant_photos")
        .select("url")
        .eq("plant_id", plant.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data.length > 0) {
        setLatestPhoto(data[0].url);
      }
    };

    fetchLatestPhoto();
  }, [plant.id]);

  const getLastWateredText = () => {
    if (!plant.last_watered) return "Never watered";
    return `${formatDistanceToNow(new Date(plant.last_watered))} ago`;
  };

  const getNextWateringText = () => {
    if (!plant.next_watering) return "Not scheduled";
    const date = new Date(plant.next_watering);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    return format(date, "MMM d, yyyy");
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);

      // Upload image to storage
      const fileExt = selectedImage.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("plant-images")
        .upload(fileName, selectedImage);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data } = await supabase.storage
        .from("plant-images")
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Add to plant_photos table
      const { error: dbError } = await supabase.from("plant_photos").insert([
        {
          plant_id: plant.id,
          url: data.publicUrl,
        },
      ]);

      if (dbError) {
        console.error("Database insert error:", dbError);
        throw new Error(dbError.message);
      }

      toast.success("Progress photo uploaded successfully!");
      setDialogOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error(
        "Error uploading photo:",
        error instanceof Error ? error.message : "Unknown error"
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Add real-time updates after watering
  const refreshPlant = async () => {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("id", plant.id)
      .single();

    if (!error && data) {
      router.refresh();
    }
  };

  const handleWaterPlant = async () => {
    try {
      setIsWatering(true);
      const now = new Date();
      const nextWatering = addDays(now, 7);

      const { error } = await supabase
        .from("plants")
        .update({
          last_watered: now.toISOString(),
          next_watering: nextWatering.toISOString(),
        })
        .eq("id", plant.id);

      if (error) throw error;

      toast.success("Plant watered successfully!");
      // Refresh the data immediately
      await refreshPlant();
    } catch (error) {
      console.error("Error watering plant:", error);
      toast.error("Failed to update watering status");
    } finally {
      setIsWatering(false);
    }
  };

  return (
    <Card className="overflow-hidden max-w-[400px]">
      <div className="aspect-[4/3] relative">
        {latestPhoto || plant.image_url ? (
          <img
            src={latestPhoto || plant.image_url}
            alt={plant.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
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
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{plant.name}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWaterPlant}
                  disabled={isWatering}
                >
                  <Droplets className="h-4 w-4 text-blue-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to water this plant</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{plant.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <span>Last Watered: {getLastWateredText()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <span>Next Watering: {getNextWateringText()}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 border-t pt-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Photo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Progress Photo</DialogTitle>
                <DialogDescription>
                  Upload a new photo to track your plant&apos;s progress over
                  time.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div
                  onClick={() =>
                    document.getElementById("progress-photo")?.click()
                  }
                  className="relative block w-full aspect-square border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  <input
                    id="progress-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setSelectedImage(e.target.files?.[0] || null)
                    }
                  />
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    {selectedImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Progress photo preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload a progress photo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImageUpload}
                    disabled={!selectedImage || isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => router.push(`/plants/${plant.id}/timeline`)}
          >
            <History className="h-4 w-4 mr-2" />
            Timeline
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => router.push(`/chat?plant=${plant.id}`)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}
