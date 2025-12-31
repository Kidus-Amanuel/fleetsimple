export type User = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: number;
  owner_id: string;
  name: string;
  registration_number?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Driver = {
  id: number;
  company_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  license_number: string;
  license_expiry?: string;
  status: 'active' | 'inactive' | 'on_leave';
  rating: number;
  total_trips: number;
  total_distance: number;
  created_at: string;
  updated_at: string;
};

export type Vehicle = {
  id: number;
  company_id: number;
  driver_id?: number;
  vehicle_number: string;
  make: string;
  model: string;
  year?: number;
  license_plate: string;
  fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  current_mileage: number;
  last_service_date?: string;
  next_service_date?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export type TripLog = {
  id: number;
  company_id: number;
  vehicle_id: number;
  driver_id: number;
  start_location: string;
  end_location: string;
  start_time: string;
  end_time?: string;
  distance?: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: number;
    vehicle_number: string;
    license_plate: string;
  };
  driver?: {
    id: number;
    full_name: string;
  };
};

export type FuelRecord = {
  id: number;
  company_id: number;
  vehicle_id: number;
  driver_id?: number;
  fuel_date: string;
  quantity: number;
  cost: number;
  mileage?: number;
  station_name?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: number;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
  driver?: {
    id: number;
    full_name: string;
  };
};

export type MaintenanceRecord = {
  id: number;
  company_id: number;
  vehicle_id: number;
  service_type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost?: number;
  service_date: string;
  next_service_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: number;
    vehicle_number: string;
    make: string;
    model: string;
    license_plate: string;
  };
};

export type SupportRequest = {
  id: number;
  company_id: number;
  user_id: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  total_vehicles: number;
  available_vehicles: number;
  in_use_vehicles: number;
  maintenance_vehicles: number;
  active_drivers: number;
  ongoing_trips: number;
  today_trips: number;
  today_distance: number;
  today_fuel_cost: number;
  pending_maintenance: number;
  pending_support: number;
};

export type VehiclePosition = {
  id: number;
  vehicle_id: number;
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
  recorded_at: string;
  vehicle?: Vehicle;
};

