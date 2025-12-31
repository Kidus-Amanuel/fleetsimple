import { supabase } from "../config/supabase";
import { SupportRequest } from "../types";

export const supportService = {
    createSupportRequest: async (request: Omit<SupportRequest, "id" | "created_at" | "updated_at" | "status" | "admin_response" | "resolved_at">) => {
        const { data, error } = await supabase
            .from("support_requests")
            .insert([{
                ...request,
                status: "pending"
            }])
            .select()
            .single();

        if (error) throw error;
        return data as SupportRequest;
    },

    getMySupportRequests: async (companyId: number) => {
        const { data, error } = await supabase
            .from("support_requests")
            .select("*")
            .eq("company_id", companyId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as SupportRequest[];
    }
};
