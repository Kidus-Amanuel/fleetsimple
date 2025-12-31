import { supabase } from "../config/supabase";

export interface VehiclePosition {
  id: number;
  vehicle_id: number;
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
  recorded_at: string;
}

export const trackingService = {
  async getLatestPositions(companyId: number) {
    const { data: vehicleIds } = await supabase
      .from("vehicles")
      .select("id")
      .eq("company_id", companyId);

    if (!vehicleIds || vehicleIds.length === 0) return [];

    const ids = vehicleIds.map(v => v.id);

    // Get the latest position for each vehicle
    // Since Supabase/PostgREST doesn't support easy 'DISTINCT ON' in simple select, 
    // we might need a RPC or a more complex query if we had many positions.
    // For now, we'll fetch the latest position per vehicle.
    
    const { data, error } = await supabase
      .from("vehicle_positions")
      .select(`
        *,
        vehicle:vehicles (
          id,
          vehicle_number,
          make,
          model,
          license_plate,
          status
        )
      `)
      .in("vehicle_id", ids)
      .order("recorded_at", { ascending: false });

    if (error) throw error;

    // Filter to get only the latest unique vehicle_id positions
    const uniquePositions: any[] = [];
    const seenVehicles = new Set();

    for (const pos of data) {
      if (!seenVehicles.has(pos.vehicle_id)) {
        uniquePositions.push(pos);
        seenVehicles.add(pos.vehicle_id);
      }
    }

    return uniquePositions;
  },

  async getVehicleTrack(vehicleId: number, startTime: string, endTime: string) {
    const { data, error } = await supabase
      .from("vehicle_positions")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .gte("recorded_at", startTime)
      .lte("recorded_at", endTime)
      .order("recorded_at", { ascending: true });

    if (error) throw error;
    return data as VehiclePosition[];
  }
};
