import { useState } from "react";
import { createClient } from "@/lib/client";
import { v4 as uuidv4 } from "uuid";

interface UploadImageOptions {
  bucket: "plant-images" | "timeline-images";
  userId: string;
}

export function useUploadImage() {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const uploadImage = async (file: File, options: UploadImageOptions) => {
    try {
      setIsUploading(true);

      if (!file) {
        throw new Error("No file selected");
      }

      // Create path: bucket/userId/uuid.ext
      const fileExt = file.name.split(".").pop();
      const filePath = `${options.userId}/${uuidv4()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(options.bucket).getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
}
