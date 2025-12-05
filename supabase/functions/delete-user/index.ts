import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  user_id: string;
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

    const body: DeleteUserRequest = await req.json();
    const { user_id, penduduk_id } = body;

    if (!user_id && !penduduk_id) {
      return new Response(
        JSON.stringify({ error: "user_id or penduduk_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let targetUserId = user_id;

    // If only penduduk_id provided, get the user_id from penduduk table
    if (!targetUserId && penduduk_id) {
      const { data: penduduk, error: pendudukError } = await supabaseAdmin
        .from("penduduk")
        .select("user_id")
        .eq("id", penduduk_id)
        .single();

      if (pendudukError || !penduduk?.user_id) {
        return new Response(
          JSON.stringify({ error: "Penduduk not found or has no linked account" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      targetUserId = penduduk.user_id;
    }

    // Prevent self-deletion
    if (targetUserId === requestingUser.id) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get target user's role
    const { data: targetRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId)
      .single();

    // Role hierarchy check
    if (targetRole) {
      if (roleData.role === "rt" && targetRole.role !== "penduduk") {
        return new Response(
          JSON.stringify({ error: "RT can only delete penduduk accounts" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (roleData.role === "rw" && (targetRole.role === "admin" || targetRole.role === "rw")) {
        return new Response(
          JSON.stringify({ error: "RW cannot delete admin or other RW accounts" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Delete related data first (cascade might not handle everything)
    
    // 1. Remove user_id from penduduk if linked
    await supabaseAdmin
      .from("penduduk")
      .update({ user_id: null })
      .eq("user_id", targetUserId);

    // 2. Remove ketua_id from RT if this user is RT ketua
    await supabaseAdmin
      .from("rt")
      .update({ ketua_id: null })
      .eq("ketua_id", targetUserId);

    // 3. Remove ketua_id from RW if this user is RW ketua
    await supabaseAdmin
      .from("rw")
      .update({ ketua_id: null })
      .eq("ketua_id", targetUserId);

    // 4. Delete user roles
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId);

    // 5. Delete profile
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    // 6. Finally delete the auth user (this is permanent!)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return new Response(
        JSON.stringify({ error: `Failed to delete user: ${deleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User account permanently deleted" 
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
