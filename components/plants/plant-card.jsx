import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Camera, History, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const healthStatusConfig = {
  optimal: {
    label: "Healthy",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  warning: {
    label: "Needs Attention",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  critical: {
    label: "Critical",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function PlantCard({ plant }) {
  const router = useRouter();
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // For now, just show a success message
    // Later we'll implement actual photo upload to Supabase
    toast.success("Photo added successfully");
    setShowPhotoDialog(false);
  };

  const handleTimelineClick = () => {
    router.push(`/plants/${plant.id}/timeline`);
  };

  const handleChatClick = () => {
    router.push(`/chat?plantId=${plant.id}`);
  };

  const healthStatus =
    healthStatusConfig[plant.healthStatus] || healthStatusConfig.warning;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full relative h-[200px]">
        <Image
          src={plant.image}
          alt={plant.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{plant.name}</CardTitle>
            <CardDescription>{plant.type}</CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={`${healthStatus.color} border-0 font-medium`}
          >
            {healthStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-grow">
        <div className="grid gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Watered:</span>
              <span>{plant.lastWatered}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next Watering:</span>
              <span>{plant.nextWatering}</span>
            </div>
            {/* {plant.issues.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <span className="block mb-1">Issues:</span>
                <ul className="list-disc pl-4 space-y-1">
                  {plant.issues.map((issue, index) => (
                    <li
                      key={index}
                      className="text-yellow-600 dark:text-yellow-400"
                    >
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
          </div>
          <div className="flex gap-2">
            <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Photo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Progress Photo</DialogTitle>
                  <DialogDescription>
                    Upload a new photo to track your {plant.name}&apos;s growth
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleTimelineClick}
            >
              <History className="mr-2 h-4 w-4" />
              Timeline
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleChatClick}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
