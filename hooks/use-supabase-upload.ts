import { createClient } from "@/lib/client";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient();

interface UploadResult {
  url?: string;
  error?: Error;
}

export function useSupabaseUpload() {
  const uploadFile = async (file: File): Promise<UploadResult> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("plant-images")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = await supabase.storage
        .from("plant-images")
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      return { url: data.publicUrl };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        error: error instanceof Error ? error : new Error("Upload failed"),
      };
    }
  };

  return { uploadFile };
}
