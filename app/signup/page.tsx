"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Signup successful. Check your email.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-bold">Create Account</h1>

        <input
          className="w-full border p-3 rounded"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-black text-white p-3 rounded">
          Sign Up
        </button>
      </form>
    </main>
  );
}