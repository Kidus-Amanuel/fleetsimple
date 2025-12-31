import { supabase } from "./config/supabase";
import { companiesService } from "./services/companies.service";
import { vehiclesService } from "./services/vehicles.service";
import { driversService } from "./services/drivers.service";
import { tripsService } from "./services/trips.service";
import { dashboardService } from "./services/dashboard.service";
import { authService } from "./services/auth.service";
import { trackingService } from "./services/tracking.service";

export const api = {
  auth: authService,
  companies: companiesService,
  vehicles: vehiclesService,
  drivers: driversService,
  trips: tripsService,
  dashboard: dashboardService,
  tracking: trackingService,
};

export * from "./types";
export { supabase } from "./config/supabase";
