"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
      Logout
    </button>
  );
}
