import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewPlantPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add New Plant</h2>
        <p className="text-muted-foreground">Add a new plant to your garden</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Photo Upload */}
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
            <div className="flex flex-col items-center space-y-2 text-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Upload a photo of your plant
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Upload Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Plant Details Form */}
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plant Name</Label>
              <Input id="name" placeholder="Enter plant name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Plant Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select plant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetable">Vegetable</SelectItem>
                  <SelectItem value="herb">Herb</SelectItem>
                  <SelectItem value="flower">Flower</SelectItem>
                  <SelectItem value="fruit">Fruit</SelectItem>
                  <SelectItem value="indoor">Indoor Plant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="greenhouse">Greenhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plantingDate">Planting Date</Label>
              <Input type="date" id="plantingDate" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                placeholder="Add any notes about your plant..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Plant</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
