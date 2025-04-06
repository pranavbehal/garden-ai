import { createClient } from "@/lib/client";
import { v4 as uuidv4 } from "uuid";

export function useStorage() {
  const supabase = createClient();
  const BUCKET_NAME = "plant-images";

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const deleteImage = async (url: string) => {
    try {
      const path = url.split("/").pop();
      if (!path) throw new Error("Invalid image URL");

      const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  };

  return {
    uploadImage,
    deleteImage,
  };
}
