import { supabase } from "../config/supabase";
import { FuelRecord } from "../types";

export const fuelService = {
    getFuelRecords: async (companyId: number) => {
        const { data, error } = await supabase
            .from("fuel_records")
            .select(`
        *,
        vehicle:vehicles(id, vehicle_number, make, model, license_plate),
        driver:drivers(id, full_name)
      `)
            .eq("company_id", companyId)
            .order("fuel_date", { ascending: false });

        if (error) throw error;
        return data as FuelRecord[];
    },

    createFuelRecord: async (record: Omit<FuelRecord, "id" | "created_at" | "vehicle" | "driver">) => {
        const { data, error } = await supabase
            .from("fuel_records")
            .insert([record])
            .select()
            .single();

        if (error) throw error;
        return data as FuelRecord;
    },

    updateFuelRecord: async (id: number, updates: Partial<FuelRecord>) => {
        // Remove nested objects to avoid errors
        const { vehicle, driver, ...cleanUpdates } = updates as any;

        const { data, error } = await supabase
            .from("fuel_records")
            .update(cleanUpdates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as FuelRecord;
    },

    deleteFuelRecord: async (id: number) => {
        const { error } = await supabase
            .from("fuel_records")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};
