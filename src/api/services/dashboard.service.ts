import { supabase } from "../config/supabase";
import { DashboardStats } from "../types";

export const dashboardService = {
  async getStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .rpc("get_dashboard_stats", { user_uuid: user.id });

    if (error) throw error;
    return data[0] as DashboardStats;
  },

  async search(searchTerm: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .rpc("search_company_data", { 
        user_uuid: user.id,
        search_term: searchTerm
      });

    if (error) throw error;
    return data;
  }
};
