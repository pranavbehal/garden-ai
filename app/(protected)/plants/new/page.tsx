"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePlants, PlantType, PlantHealthStatus } from "@/hooks/use-plants";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";

const plantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "vegetable",
    "herb",
    "indoor",
    "outdoor",
    "fruit",
    "other",
  ] as const),
  notes: z.string().optional(),
});

type NewPlantFormValues = z.infer<typeof plantSchema>;

export default function NewPlantPage() {
  const router = useRouter();
  const { addPlant } = usePlants();
  const { uploadFile } = useSupabaseUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);

  const form = useForm<NewPlantFormValues>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: "",
      type: "indoor",
      notes: "",
    },
  });

  const onSubmit = async (values: NewPlantFormValues) => {
    let uploadedImageUrl: string | undefined;

    try {
      setIsSubmitting(true);

      if (attachedImage) {
        const { url, error: uploadError } = await uploadFile(attachedImage);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        if (!url) {
          throw new Error("No URL returned from image upload");
        }

        uploadedImageUrl = url;
      }

      const newPlant = {
        ...values,
        image_url: uploadedImageUrl,
        health_status: "optimal" as PlantHealthStatus,
        last_watered: undefined,
        next_watering: undefined,
      };

      await addPlant(newPlant);
      toast.success("Plant added successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error adding plant:", error);

      if (uploadedImageUrl) {
        try {
          console.warn("Image cleanup not implemented");
        } catch (cleanupError) {
          console.error("Failed to clean up uploaded image:", cleanupError);
        }
      }

      toast.error(
        error instanceof Error ? error.message : "Failed to add plant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-8 space-y-8">
      <div>
        <div className="container">
          <h1 className="text-3xl font-bold tracking-tight">Add New Plant</h1>
          <p className="text-muted-foreground">
            Add a new plant to your garden
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div
                onClick={() => document.getElementById("image-input")?.click()}
                className="relative block w-full aspect-square border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setAttachedImage(e.target.files?.[0] || null)
                  }
                />
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  {attachedImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={URL.createObjectURL(attachedImage)}
                        alt="Plant preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachedImage(null);
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
                        Upload a photo of your plant
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click or drag and drop
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter plant name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plant Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plant type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vegetable">Vegetable</SelectItem>
                          <SelectItem value="herb">Herb</SelectItem>
                          <SelectItem value="indoor">Indoor Plant</SelectItem>
                          <SelectItem value="outdoor">Outdoor Plant</SelectItem>
                          <SelectItem value="fruit">Fruit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes about your plant..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !attachedImage}
                    variant={attachedImage ? "default" : "secondary"}
                  >
                    {isSubmitting ? "Adding Plant..." : "Save Plant"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
