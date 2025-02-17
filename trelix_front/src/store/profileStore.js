import { create } from "zustand";
import axios from "axios";

export const useProfileStore = create((set) => ({
  user: null,
  fetchUser: async () => {
    try {
      // Optionally, you can manually extract token from cookies if needed
      const token = document.cookie.split('token=')[1];  // Or use your method to retrieve token

      const res = await axios.get("/api/info/profile", {
        headers: {
          "Authorization": `Bearer ${token}`, // Pass token in the Authorization header
        },
        withCredentials: true,  // Ensure cookies are sent with the request
      });

      set({ user: res.data });
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ user: null });
    }
  },
  clearUser: () => set({ user: null }),  // To clear user on logout
}));
