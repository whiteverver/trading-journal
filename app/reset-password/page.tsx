"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");

  async function updatePassword() {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully");
    window.location.href = "/login";
  }

  return (
    <div className="max-w-md mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Reset Password</h1>

      <input
        type="password"
        placeholder="New Password"
        className="border p-3 w-full mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={updatePassword}
        className="bg-black text-white px-6 py-3 rounded w-full"
      >
        Update Password
      </button>
    </div>
  );
}