import { supabase } from "../config/supabase";
import { Vehicle } from "../types";

export const vehiclesService = {
  async getVehicles(companyId: number) {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, driver:drivers(full_name)")
      .eq("company_id", companyId);

    if (error) throw error;
    return data;
  },

  async createVehicle(vehicle: Omit<Vehicle, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert([vehicle])
      .select()
      .single();

    if (error) throw error;
    return data as Vehicle;
  },

  async deleteVehicle(id: number) {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
