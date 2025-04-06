import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="relative block w-full aspect-square border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center h-full gap-2">
        {value ? (
          <div className="relative w-full h-full">
            <img
              src={value}
              alt="Upload preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
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
  );
}
