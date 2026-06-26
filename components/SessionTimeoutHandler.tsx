"use client";

import { useEffect } from "react";
import { signOut, getStoredSession } from "@/lib/supabase/auth";

export default function SessionTimeoutHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 10 minutes timeout in milliseconds
    const TIMEOUT_MS = 10 * 60 * 1000;
    const LAST_ACTIVE_KEY = "ugintern_last_active";

    // Set initial last active time if not set
    if (!sessionStorage.getItem(LAST_ACTIVE_KEY)) {
      sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    }

    const resetTimer = () => {
      sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    };

    // Listen to user activity events
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    const checkInterval = setInterval(async () => {
      const session = getStoredSession();
      if (!session) return; // Only check if logged in

      const lastActiveStr = sessionStorage.getItem(LAST_ACTIVE_KEY);
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (Date.now() - lastActive > TIMEOUT_MS) {
          // Session expired due to inactivity
          await signOut();
          // Clear active timers
          sessionStorage.removeItem(LAST_ACTIVE_KEY);
          // Redirect to login page with reason query parameter
          window.location.href = "/auth/login?reason=timeout";
        }
      }
    }, 5000); // Check every 5 seconds

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(checkInterval);
    };
  }, []);

  return null;
}
