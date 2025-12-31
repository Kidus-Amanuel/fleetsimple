import { supabase } from "../config/supabase";
import { DashboardStats, TripLog, Vehicle, Driver } from "../types";

export const dashboardService = {
  async getStats(userId: string) {
    const { data, error } = await supabase
      .rpc("get_dashboard_stats", { user_uuid: userId });

    if (error) throw error;
    return data[0] as DashboardStats;
  },

  async getActiveTrips(userId: string) {
    // Get user's company
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", userId)
      .single();

    if (!company) return [];

    // Fetch active trips with vehicle and driver info
    const { data, error } = await supabase
      .from("trip_logs")
      .select(`
        *,
        vehicles:vehicle_id (vehicle_number, make, model),
        drivers:driver_id (full_name)
      `)
      .eq("company_id", company.id)
      .eq("status", "in_progress")
      .order("start_time", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async getRecentActivity(userId: string) {
    // Get user's company
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", userId)
      .single();

    if (!company) return [];

    const activities: any[] = [];

    // Get recent completed trips
    const { data: trips } = await supabase
      .from("trip_logs")
      .select("*, vehicles:vehicle_id(vehicle_number)")
      .eq("company_id", company.id)
      .eq("status", "completed")
      .order("end_time", { ascending: false })
      .limit(3);

    if (trips) {
      trips.forEach((trip: any) => {
        activities.push({
          time: new Date(trip.end_time).toLocaleString(),
          action: "Trip completed",
          detail: `${trip.vehicles?.vehicle_number || "Vehicle"} - ${trip.distance?.toFixed(1) || "0"} km`,
          type: "success",
          timestamp: new Date(trip.end_time).getTime(),
        });
      });
    }

    // Get recent fuel records
    const { data: fuelRecords } = await supabase
      .from("fuel_records")
      .select("*, vehicles:vehicle_id(vehicle_number)")
      .eq("company_id", company.id)
      .order("fuel_date", { ascending: false })
      .limit(2);

    if (fuelRecords) {
      fuelRecords.forEach((record: any) => {
        activities.push({
          time: new Date(record.fuel_date).toLocaleString(),
          action: "Fuel record added",
          detail: `${record.vehicles?.vehicle_number || "Vehicle"} - $${record.cost?.toFixed(2) || "0"}`,
          type: "info",
          timestamp: new Date(record.fuel_date).getTime(),
        });
      });
    }

    // Get recent maintenance
    const { data: maintenance } = await supabase
      .from("maintenance_records")
      .select("*, vehicles:vehicle_id(vehicle_number)")
      .eq("company_id", company.id)
      .in("status", ["scheduled", "in_progress"])
      .order("service_date", { ascending: false })
      .limit(2);

    if (maintenance) {
      maintenance.forEach((record: any) => {
        activities.push({
          time: new Date(record.service_date).toLocaleString(),
          action: "Maintenance scheduled",
          detail: `${record.vehicles?.vehicle_number || "Vehicle"} - ${record.description}`,
          type: "warning",
          timestamp: new Date(record.service_date).getTime(),
        });
      });
    }

    // Get recent drivers
    const { data: drivers } = await supabase
      .from("drivers")
      .select("full_name, created_at")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (drivers) {
      drivers.forEach((driver: any) => {
        activities.push({
          time: new Date(driver.created_at).toLocaleString(),
          action: "New driver added",
          detail: driver.full_name,
          type: "info",
          timestamp: new Date(driver.created_at).getTime(),
        });
      });
    }

    // Sort by timestamp and return top 5
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(({ timestamp, ...rest }) => rest);
  },

  async search(searchTerm: string, userId: string) {
    const { data, error } = await supabase
      .rpc("search_company_data", {
        user_uuid: userId,
        search_term: searchTerm
      });

    if (error) throw error;
    return data;
  }
};

