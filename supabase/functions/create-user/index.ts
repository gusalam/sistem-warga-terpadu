import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  nama: string;
  role: "admin" | "rw" | "rt" | "penduduk";
  rw_id?: string;
  rt_id?: string;
  penduduk_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is authenticated and has admin/rw/rt role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requesting user has appropriate role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "User role not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowedRoles = ["admin", "rw", "rt"];
    if (!allowedRoles.includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CreateUserRequest = await req.json();
    const { email, password, nama, role, rw_id, rt_id, penduduk_id } = body;

    // Validate input
    if (!email || !password || !nama || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role permissions
    if (roleData.role === "rw" && role === "admin") {
      return new Response(
        JSON.stringify({ error: "RW cannot create admin accounts" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (roleData.role === "rt" && (role === "admin" || role === "rw")) {
      return new Response(
        JSON.stringify({ error: "RT cannot create admin or RW accounts" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nama,
      },
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the profile with RT/RW association
    const profileUpdate: Record<string, string | null> = { nama };
    if (rt_id) profileUpdate.rt_id = rt_id;
    if (rw_id) profileUpdate.rw_id = rw_id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", newUser.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    // Add the role to user_roles table
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        role,
      });

    if (roleInsertError) {
      console.error("Error inserting role:", roleInsertError);
      // Rollback: delete the created user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to assign role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If creating for a penduduk, link the user_id to the penduduk record
    if (penduduk_id) {
      const { error: pendudukError } = await supabaseAdmin
        .from("penduduk")
        .update({ user_id: newUser.user.id })
        .eq("id", penduduk_id);

      if (pendudukError) {
        console.error("Error linking penduduk:", pendudukError);
      }
    }

    // If creating for RT, update the rt table with ketua_id
    if (role === "rt" && rt_id) {
      const { error: rtError } = await supabaseAdmin
        .from("rt")
        .update({ ketua_id: newUser.user.id })
        .eq("id", rt_id);

      if (rtError) {
        console.error("Error updating RT ketua:", rtError);
      }
    }

    // If creating for RW, update the rw table with ketua_id
    if (role === "rw" && rw_id) {
      const { error: rwError } = await supabaseAdmin
        .from("rw")
        .update({ ketua_id: newUser.user.id })
        .eq("id", rw_id);

      if (rwError) {
        console.error("Error updating RW ketua:", rwError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id,
        message: `Akun ${role.toUpperCase()} berhasil dibuat` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
