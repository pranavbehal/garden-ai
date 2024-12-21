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

const mockPlants = [
  {
    id: "1",
    name: "Tomato Plant",
    type: "Vegetable",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa",
  },
  {
    id: "2",
    name: "Basil",
    type: "Herb",
    image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733",
  },
  {
    id: "3",
    name: "Snake Plant",
    type: "Indoor",
    image: "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6",
  },
];

// Helper function to format AI responses
const formatAIResponse = (content) => {
  const parts = content.split(/(\d+\.\s+)/);

  if (parts.length > 1) {
    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (/^\d+\.\s+$/.test(part)) {
            return null; // Skip the number prefix
          }

          // If it starts with ** for bold text
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

          // Regular text
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
  const messagesEndRef = useRef(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedImageUrl, setAttachedImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const selectedPlant = mockPlants.find((p) => p.id === selectedOption);

  const systemMessage =
    selectedOption === "general"
      ? "You are a general gardening assistant. Provide helpful advice about plants and gardening."
      : `You are helping with a specific plant: ${selectedPlant?.name}. Focus on care tips and solutions specific to this plant.`;

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      systemMessage,
      plantImage: selectedPlant?.image,
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

  useEffect(() => {
    const plantId = searchParams.get("plantId");
    if (plantId) {
      setSelectedOption(plantId);
    }
  }, [searchParams]);

  const handleImageUpload = async (e) => {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !attachedImage) return;
    if (isTyping) return;

    setIsTyping(true);

    const attachments = [];
    if (attachedImage) {
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

    handleInputChange({ target: { value: "" } });
  };

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

        <Select value={selectedOption} onValueChange={setSelectedOption}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Choose what to discuss" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Questions</SelectItem>
            <Separator className="my-2" />
            {mockPlants.map((plant) => (
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
              <Image
                src={selectedPlant.image}
                alt={selectedPlant.name}
                fill
                className="object-cover"
              />
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
                className={`rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-[30%]"
                    : "bg-muted mr-[30%]"
                }`}
              >
                {message.role === "user"
                  ? message.content
                  : formatAIResponse(message.content)}
                {message.attachments?.length > 0 && (
                  <div className="mt-2">
                    {message.attachments.map((attachment, index) => (
                      <Image
                        key={index}
                        src={attachment.url}
                        width={300}
                        height={300}
                        alt={`Attached image ${index + 1}`}
                        className="rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3 text-sm">
              <div className="rounded-lg bg-muted p-4 mr-[30%]">
                <span className="animate-pulse">AI is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Attached Image Preview */}
      {attachedImageUrl && (
        <div className="flex-none px-8 pb-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted max-w-3xl mx-auto">
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
              <Image
                src={attachedImageUrl}
                alt="Attached image"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Image attached</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearAttachedImage}
              className="text-red-500 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Input Section */}
      <form onSubmit={handleFormSubmit} className="flex-none p-8 pt-4 border-t">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              className="flex-1 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder={
                selectedPlant
                  ? `Ask about your ${selectedPlant.name}...`
                  : "Ask about gardening, plant care, or upload a photo..."
              }
            />
            <Button type="submit" size="icon" disabled={isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
