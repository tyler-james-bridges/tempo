import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://flmrudqicddotnonpckr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbXJ1ZHFpY2Rkb3Rub25wY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTQwMTAsImV4cCI6MjA4MzI5MDAxMH0.qGzKb1OXn0uhcXWqp1Dw44vs8C1RW0pOmXs-tpPY_Ik";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
