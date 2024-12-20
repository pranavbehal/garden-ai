"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { Camera, Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock data - replace with your actual plant data later
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

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState("general");
  const [isTyping, setIsTyping] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [showUserMessage, setShowUserMessage] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const messagesEndRef = useRef(null);

  const selectedPlant = mockPlants.find((p) => p.id === selectedOption);

  const systemMessage =
    selectedOption === "general"
      ? "You are a general gardening assistant. Provide helpful advice about plants and gardening."
      : `You are helping with a specific plant: ${selectedPlant?.name}. Focus on care tips and solutions specific to this plant.`;

  const { messages, input, handleInputChange, append } = useChat({
    api: "/api/chat",
    initialMessages: [],
    body: {
      systemMessage,
    },
    onFinish: () => {
      setIsTyping(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || isTyping || isStopping) return;

    const userInput = input.trim().toLowerCase();

    if (messages.length === 0) {
      setShowTitle(false);
    }

    const userMessage = `Me: ${userInput}`;
    setShowUserMessage(true);
    setCurrentText(userMessage);

    handleInputChange({
      target: { value: "" },
    });
    setTimeout(async () => {
      setIsTyping(true);
      await append({
        content: userMessage,
        role: "user",
      });
      setShowUserMessage(false);
    }, 500);
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

      {/* Chat Messages Section */}
      <ScrollArea className="flex-grow px-8 py-6">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex gap-3 text-sm ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              <div
                className={`rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {showUserMessage && (
            <div className="flex gap-3 text-sm justify-end">
              <div className="rounded-lg bg-primary text-primary-foreground p-3">
                {currentText}
              </div>
            </div>
          )}
          {isTyping && (
            <div className="flex gap-3 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input Section */}
      <form onSubmit={handleSubmit} className="flex-none p-8 pt-4 border-t">
        <div className="flex gap-2 max-w-5xl mx-auto">
          <Button type="button" variant="outline" size="icon">
            <Camera className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon">
            <ImageIcon className="h-4 w-4" />
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
