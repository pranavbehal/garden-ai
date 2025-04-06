import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { useAuth } from "@/hooks/use-auth";

export type PlantType =
  | "vegetable"
  | "herb"
  | "indoor"
  | "outdoor"
  | "fruit"
  | "other";
export type PlantHealthStatus = "optimal" | "warning" | "critical";

export interface Plant {
  id: string;
  user_id?: string;
  name: string;
  type: PlantType;
  health_status: PlantHealthStatus;
  image_url?: string;
  last_watered?: Date;
  next_watering?: Date;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const supabase = createClient();

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("plants")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Convert date strings to Date objects
      const processedData = (data || []).map((plant) => ({
        ...plant,
        next_watering: plant.next_watering
          ? new Date(plant.next_watering)
          : undefined,
        last_watered: plant.last_watered
          ? new Date(plant.last_watered)
          : undefined,
      }));

      setPlants(processedData);
    } catch (err) {
      console.error("Error fetching plants:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch plants");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user]);

  const addPlant = async (
    plantData: Omit<Plant, "id" | "created_at" | "updated_at">
  ) => {
    try {
      setIsLoading(true);

      // Prepare the data for the database
      const dbPlantData = {
        ...plantData,
        user_id: user?.id,
      };

      const { data, error: insertError } = await supabase
        .from("plants")
        .insert([dbPlantData])
        .select()
        .single();

      if (insertError) {
        console.error("Database error:", insertError);
        throw new Error(insertError.message);
      }

      if (!data) {
        throw new Error("No data returned from insert");
      }

      // Convert the returned data back
      const newPlant: Plant = {
        ...data,
        next_watering: data.next_watering
          ? new Date(data.next_watering)
          : undefined,
        last_watered: data.last_watered
          ? new Date(data.last_watered)
          : undefined,
      };

      setPlants((prev) => [newPlant, ...prev]);
      return newPlant;
    } catch (err) {
      console.error("Error adding plant:", err);
      throw err instanceof Error ? err : new Error("Failed to add plant");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlant = async (id: string, updates: Partial<Plant>) => {
    try {
      setIsLoading(true);

      const { data, error: updateError } = await supabase
        .from("plants")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (!data) {
        throw new Error("No data returned from update");
      }

      // Convert the returned data back
      const updatedPlant: Plant = {
        ...data,
        next_watering: data.next_watering
          ? new Date(data.next_watering)
          : undefined,
        last_watered: data.last_watered
          ? new Date(data.last_watered)
          : undefined,
      };

      setPlants((prev) =>
        prev.map((plant) => (plant.id === id ? updatedPlant : plant))
      );
      return updatedPlant;
    } catch (err) {
      console.error("Error updating plant:", err);
      throw err instanceof Error ? err : new Error("Failed to update plant");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlant = async (id: string) => {
    try {
      setIsLoading(true);
      const { error: deleteError } = await supabase
        .from("plants")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setPlants((prev) => prev.filter((plant) => plant.id !== id));
    } catch (err) {
      console.error("Error deleting plant:", err);
      throw err instanceof Error ? err : new Error("Failed to delete plant");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    plants,
    isLoading,
    error,
    addPlant,
    updatePlant,
    deletePlant,
    refresh,
  };
}
