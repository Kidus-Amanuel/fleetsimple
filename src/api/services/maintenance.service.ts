import { supabase } from "../config/supabase";
import { MaintenanceRecord } from "../types";

export const maintenanceService = {
    getMaintenanceRecords: async (companyId: number) => {
        const { data, error } = await supabase
            .from("maintenance_records")
            .select(`
        *,
        vehicle:vehicles(id, vehicle_number, make, model, license_plate)
      `)
            .eq("company_id", companyId)
            .order("service_date", { ascending: false });

        if (error) throw error;
        return data as MaintenanceRecord[];
    },

    createMaintenanceRecord: async (record: Omit<MaintenanceRecord, "id" | "created_at" | "vehicle">) => {
        const { data, error } = await supabase
            .from("maintenance_records")
            .insert([record])
            .select()
            .single();

        if (error) throw error;
        return data as MaintenanceRecord;
    },

    updateMaintenanceRecord: async (id: number, updates: Partial<MaintenanceRecord>) => {
        // Remove nested vehicle object if present to avoid errors
        const { vehicle, ...cleanUpdates } = updates as any;

        const { data, error } = await supabase
            .from("maintenance_records")
            .update(cleanUpdates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as MaintenanceRecord;
    },

    deleteMaintenanceRecord: async (id: number) => {
        const { error } = await supabase
            .from("maintenance_records")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};
