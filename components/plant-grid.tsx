import { Plant } from "@/hooks/use-plants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";

interface PlantGridProps {
  plants: Plant[];
}

export function PlantGrid({ plants }: PlantGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {plants.map((plant) => (
        <Card key={plant.id}>
          <CardHeader>
            <CardTitle>{plant.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {plant.imageUrl && (
              <div className="relative h-48 w-full mb-4">
                <Image
                  src={plant.imageUrl}
                  alt={plant.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <div className="space-y-2">
              <p>Type: {plant.type}</p>
              <p>Health: {plant.healthStatus}</p>
              {plant.lastWatered && (
                <p>
                  Last watered:{" "}
                  {format(new Date(plant.lastWatered), "MMM d, yyyy")}
                </p>
              )}
              {plant.nextWatering && (
                <p>
                  Next watering:{" "}
                  {format(new Date(plant.nextWatering), "MMM d, yyyy")}
                </p>
              )}
              {plant.notes && <p>Notes: {plant.notes}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
