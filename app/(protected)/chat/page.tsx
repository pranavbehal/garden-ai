"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { Camera, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { usePlants, Plant } from "@/hooks/use-plants";

const formatAIResponse = (content: string) => {
  const parts = content.split(/(\d+\.\s+)/);

  if (parts.length > 1) {
    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (/^\d+\.\s+$/.test(part)) {
            return null;
          }

          if (part.includes("**")) {
            const [title, ...description] = part.split(":");
            return (
              <div key={index} className="space-y-1">
                <div className="font-medium">{title.replace(/\*\*/g, "")}:</div>
                {description.length > 0 && (
                  <div className="text-muted-foreground">
                    {description.join(":").trim()}
                  </div>
                )}
              </div>
            );
          }

          return part && <p key={index}>{part.trim()}</p>;
        })}
      </div>
    );
  }

  return <p>{content}</p>;
};

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState("general");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { plants, isLoading } = usePlants();

  useEffect(() => {
    const plant = searchParams.get("plant");
    if (plant) {
      setSelectedOption(plant);
    }
  }, []);

  const handlePlantChange = (value: string) => {
    setSelectedOption(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === "general") {
      newParams.delete("plant");
    } else {
      newParams.set("plant", value);
    }
    router.replace(`/chat?${newParams.toString()}`, { scroll: false });
  };

  const selectedPlant = plants.find((p) => p.id === selectedOption);

  const systemMessage =
    selectedOption === "general"
      ? "You are a general gardening assistant. Provide helpful advice about plants and gardening."
      : `You are helping with a specific plant: ${selectedPlant?.name}. Focus on care tips and solutions specific to this plant.`;

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      systemMessage,
      plantImage: selectedPlant?.image_url,
    },
    onFinish: () => {
      setIsTyping(false);
      setAttachedImage(null);
      setAttachedImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const url = URL.createObjectURL(file);
    setAttachedImage(file);
    setAttachedImageUrl(url);
    toast.success("Image attached successfully");
  };

  const clearAttachedImage = () => {
    setAttachedImage(null);
    setAttachedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachedImage) return;
    if (isTyping) return;

    setIsTyping(true);

    const attachments = [];
    if (attachedImage && attachedImageUrl) {
      attachments.push({
        name: "uploaded-image",
        type: attachedImage.type,
        url: attachedImageUrl,
      });
    }

    await handleSubmit(e, {
      experimental_attachments:
        attachments.length > 0 ? attachments : undefined,
    });

    handleInputChange({
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header and Select Section */}
      <div className="flex-none p-8 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Garden AI Assistant
            </h2>
            <p className="text-muted-foreground">
              Ask questions about your plants or get general gardening advice
            </p>
          </div>
        </div>

        <Select value={selectedOption} onValueChange={handlePlantChange}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Choose what to discuss" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Questions</SelectItem>
            {plants.length > 0 && <Separator className="my-2" />}
            {plants.map((plant) => (
              <SelectItem key={plant.id} value={plant.id}>
                {plant.name} ({plant.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Plant Preview */}
      {selectedPlant && (
        <div className="flex-none px-8 py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
              {selectedPlant.image_url ? (
                <Image
                  src={selectedPlant.image_url}
                  alt={selectedPlant.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">{selectedPlant.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedPlant.type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Section */}
      <ScrollArea className="flex-grow px-8 py-6">
        <div className="w-full space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex gap-3 text-base ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.role === "assistant"
                  ? formatAIResponse(message.content)
                  : message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="flex-none p-8 pt-4">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Image Preview */}
          {attachedImageUrl && (
            <div className="relative w-24 h-24">
              <Image
                src={attachedImageUrl}
                alt="Attached"
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={clearAttachedImage}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-background border shadow-sm hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-5 w-5" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </Button>
            <input
              className="flex-grow px-4 py-2 rounded-lg bg-muted"
              value={input}
              placeholder={
                selectedPlant
                  ? `Ask about your ${selectedPlant.name}...`
                  : "Ask a gardening question..."
              }
              onChange={handleInputChange}
            />
            <Button type="submit" size="icon" disabled={isTyping}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
