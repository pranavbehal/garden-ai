"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import Image from "next/image";

export default function NewPlantPage() {
  // State for image upload handling
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedImage(file);
    toast.success("Photo selected successfully");
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add New Plant</h2>
        <p className="text-muted-foreground">Add a new plant to your garden</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image upload section */}
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="plant-photo"
              onChange={handlePhotoUpload}
            />
            {previewUrl ? (
              // Image preview with change option
              <div className="relative w-full aspect-square">
                <Image
                  src={previewUrl}
                  alt="Plant preview"
                  fill
                  className="object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-4 right-4"
                  onClick={() => document.getElementById("plant-photo").click()}
                >
                  Change Photo
                </Button>
              </div>
            ) : (
              // Upload prompt
              <label
                htmlFor="plant-photo"
                className="flex flex-col items-center space-y-2 text-center cursor-pointer"
              >
                <Camera className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Upload a photo of your plant
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Plant details form */}
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
