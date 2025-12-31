import { supabase } from "./config/supabase";
import { companiesService } from "./services/companies.service";
import { vehiclesService } from "./services/vehicles.service";
import { driversService } from "./services/drivers.service";
import { tripsService } from "./services/trips.service";
import { dashboardService } from "./services/dashboard.service";
import { authService } from "./services/auth.service";
import { trackingService } from "./services/tracking.service";
import { maintenanceService } from "./services/maintenance.service";
import { fuelService } from "./services/fuel.service";
import { analyticsService } from "./services/analytics.service";
import { supportService } from "./services/support.service";

export const api = {
  auth: authService,
  companies: companiesService,
  vehicles: vehiclesService,
  drivers: driversService,
  trips: tripsService,
  dashboard: dashboardService,
  tracking: trackingService,
  maintenance: maintenanceService,
  fuel: fuelService,
  analytics: analyticsService,
  support: supportService,
};

export * from "./types";
export * from "./services/maintenance.service";
export * from "./services/fuel.service";
export { supabase } from "./config/supabase";
