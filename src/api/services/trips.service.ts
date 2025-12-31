import { supabase } from "../config/supabase";
import { TripLog } from "../types";

export const tripsService = {
  async getTrips(companyId: number) {
    const { data, error } = await supabase
      .from("trip_logs")
      .select(`
        *,
        vehicles (vehicle_number, make, model),
        drivers (full_name)
      `)
      .eq("company_id", companyId)
      .order("start_time", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createTrip(trip: Omit<TripLog, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("trip_logs")
      .insert([trip])
      .select()
      .single();

    if (error) throw error;
    return data as TripLog;
  },
};
