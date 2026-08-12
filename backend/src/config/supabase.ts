import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY as string;

// Inicializa a conexão com o Supabase
export const supabase = createClient(supabaseUrl, supabaseSecretKey);