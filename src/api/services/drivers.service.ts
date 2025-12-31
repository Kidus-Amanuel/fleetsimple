import { supabase } from "../config/supabase";
import { Driver } from "../types";

export const driversService = {
  async getDrivers(companyId: number) {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("company_id", companyId);

    if (error) throw error;
    return data as Driver[];
  },

  async createDriver(driver: Omit<Driver, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("drivers")
      .insert([driver])
      .select()
      .single();

    if (error) throw error;
    return data as Driver;
  },

  async updateDriver(id: number, updates: Partial<Driver>) {
    const { data, error } = await supabase
      .from("drivers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Driver;
  },

  async deleteDriver(id: number) {
    const { error } = await supabase
      .from("drivers")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
