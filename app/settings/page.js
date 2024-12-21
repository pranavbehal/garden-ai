"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSettings } from "@/lib/settings";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    zipCode: "",
    growingZone: "",
    weatherAlerts: true,
    plantReminders: true,
    theme: "system",
  });
  const [isDirty, setIsDirty] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setFormData({
      name: settings.name || "",
      email: settings.email || "",
      zipCode: settings.zipCode || "",
      growingZone: settings.growingZone || "",
      weatherAlerts: settings.notifications?.weather ?? true,
      plantReminders: settings.notifications?.plantCare ?? true,
      theme: settings.theme || "system",
    });
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    updateSettings({
      name: formData.name,
      email: formData.email,
      zipCode: formData.zipCode,
      growingZone: formData.growingZone,
      theme: formData.theme,
      notifications: {
        weather: formData.weatherAlerts,
        plantCare: formData.plantReminders,
      },
    });
    setIsDirty(false);
    toast.success("Settings saved successfully");
  };

  const handleCancel = () => {
    setFormData({
      name: settings.name || "",
      email: settings.email || "",
      zipCode: settings.zipCode || "",
      growingZone: settings.growingZone || "",
      weatherAlerts: settings.notifications?.weather ?? true,
      plantReminders: settings.notifications?.plantCare ?? true,
      theme: settings.theme || "system",
    });
    setIsDirty(false);
    toast.info("Changes discarded");
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Your email"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="zipcode">Zip Code</Label>
              <Input
                id="zipcode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="Enter zip code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="growingZone">Growing Zone</Label>
              <Select
                value={formData.growingZone}
                onValueChange={(value) =>
                  handleInputChange("growingZone", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select growing zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6a">Zone 6a</SelectItem>
                  <SelectItem value="6b">Zone 6b</SelectItem>
                  <SelectItem value="7a">Zone 7a</SelectItem>
                  <SelectItem value="7b">Zone 7b</SelectItem>
                  <SelectItem value="8a">Zone 8a</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Weather Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about severe weather
                </p>
              </div>
              <Button
                variant={formData.weatherAlerts ? "default" : "outline"}
                onClick={() =>
                  handleInputChange("weatherAlerts", !formData.weatherAlerts)
                }
              >
                {formData.weatherAlerts ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Plant Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about watering and maintenance
                </p>
              </div>
              <Button
                variant={formData.plantReminders ? "default" : "outline"}
                onClick={() =>
                  handleInputChange("plantReminders", !formData.plantReminders)
                }
              >
                {formData.plantReminders ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => handleInputChange("theme", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel} disabled={!isDirty}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isDirty}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
