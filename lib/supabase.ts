import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(url, anonKey);

export interface Agent {
  id: string;
  name: string;        // name
  avatar_url?: string; // avatar image
  tagline?: string;    // short bio / one-liner
  models: string[];    // models
  price: string;       // price
  description: string; // what it does
  rating: number;      // rating
  url?: string;        // url
  created_at?: string;
}

// Fetch all agents (used by the match API)
export async function getAllAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("rating", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as Agent[];
}

// Fetch a single agent by id (used by the detail page)
export async function getAgentById(id: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Agent;
}
