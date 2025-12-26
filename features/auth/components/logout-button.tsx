"use client";

import { LogOut } from "lucide-react";
import { logoutUser } from "@/actions/auth-actions";

/**
 * Logout Button Component.
 * 
 * A reusable button that triggers the `logoutUser` server action.
 * Displays a logout icon and label.
 *
 * @returns A button element that initiates the logout process.
 */

export function LogoutButton() {
  return (
    <button 
      onClick={() => logoutUser()}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors w-full"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}