
import { supabase } from "../config/supabase";

export interface AnalyticsData {
    trips: any[];
    fuel: any[];
    maintenance: any[];
}

export const analyticsService = {
    getAnalyticsData: async (companyId: number, startDate: string, endDate: string) => {

        // Fetch Trips
        const { data: trips, error: tripsError } = await supabase
            .from("trip_logs")
            .select("id, distance, start_time, end_time, vehicle_id, status")
            .eq("company_id", companyId)
            .gte("start_time", startDate)
            .lte("start_time", endDate);

        if (tripsError) throw tripsError;

        // Fetch Fuel
        const { data: fuel, error: fuelError } = await supabase
            .from("fuel_records")
            .select("id, cost, quantity, fuel_date, vehicle_id")
            .eq("company_id", companyId)
            .gte("fuel_date", startDate)
            .lte("fuel_date", endDate);

        if (fuelError) throw fuelError;

        // Fetch Maintenance
        const { data: maintenance, error: maintError } = await supabase
            .from("maintenance_records")
            .select("id, cost, service_date, vehicle_id")
            .eq("company_id", companyId)
            .gte("service_date", startDate)
            .lte("service_date", endDate);

        if (maintError) throw maintError;

        return {
            trips: trips || [],
            fuel: fuel || [],
            maintenance: maintenance || []
        };
    }
};
