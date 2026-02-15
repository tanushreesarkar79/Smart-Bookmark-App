"use client";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
  options: {
  redirectTo: "https://smart-bookmark-app-neon.vercel.app/dashboard",
  },
    });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push("/dashboard");
      }
    });
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-black text-white rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
