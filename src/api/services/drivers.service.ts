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
};
