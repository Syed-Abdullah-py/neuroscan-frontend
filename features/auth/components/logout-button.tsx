"use client";

import { LogOut } from "lucide-react";
import { logoutUser } from "@/actions/auth-actions";

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