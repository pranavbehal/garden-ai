import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "watering" | "fertilizing" | "pruning" | "observation" | "other";
  status?: "completed" | "pending" | "missed";
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "watering":
        return "💧";
      case "fertilizing":
        return "🌱";
      case "pruning":
        return "✂️";
      case "observation":
        return "👁️";
      default:
        return "📝";
    }
  };

  const getStatusColor = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "missed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <ScrollArea className={cn("h-[400px] w-full rounded-md border", className)}>
      <div className="p-4">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "relative flex gap-4 pb-8",
              index === events.length - 1 ? "pb-0" : ""
            )}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  event.status ? getStatusColor(event.status) : "bg-primary"
                )}
              >
                <span role="img" aria-label={event.type}>
                  {getEventIcon(event.type)}
                </span>
              </div>
              {index !== events.length - 1 && (
                <div className="h-full w-0.5 bg-border" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium leading-none">{event.title}</h4>
                <span className="text-sm text-muted-foreground">
                  {event.date}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
