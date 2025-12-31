import { supabase } from "../config/supabase";
import { Company } from "../types";

export const companiesService = {
  async getMyCompany() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as Company | null;
  },

  async createCompany(company: Omit<Company, "id" | "owner_id" | "created_at" | "updated_at">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("companies")
      .insert([{ ...company, owner_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  },
};
