import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Camera, History, MessageSquare } from "lucide-react";

export function PlantCard({ plant }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full relative h-[200px]">
        <Image
          src={plant.image}
          alt={plant.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle>{plant.name}</CardTitle>
        <CardDescription>{plant.type}</CardDescription>
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
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <a href={`/chat?plantId=${plant.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
