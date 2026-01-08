import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ldwvylgoixbyktmrykrx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkd3Z5bGdvaXhieWt0bXJ5a3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDcxNzQsImV4cCI6MjA4MzQ4MzE3NH0.L5gQktJUOrETrnR6aApNP1jGnMf9ivVkYlxHuFi8rmo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
