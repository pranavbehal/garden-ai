import { AlertTriangle, Cloud, Thermometer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const alertIcons = {
  frost: Thermometer,
  heat: Thermometer,
  rain: Cloud,
  general: AlertTriangle,
};

export function WeatherAlerts({ alerts }) {
  if (!alerts?.length) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => {
        const Icon = alertIcons[alert.type] || AlertTriangle;

        return (
          <Alert
            key={index}
            variant={alert.severity === "high" ? "destructive" : "default"}
            className={
              alert.severity === "high"
                ? "border-red-500 dark:border-red-400"
                : "border-yellow-500 dark:border-yellow-400"
            }
          >
            <Icon className="h-4 w-4" />
            <AlertTitle className="ml-2">
              {alert.title || "Weather Alert"}
            </AlertTitle>
            <AlertDescription className="ml-2">
              {alert.message}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
