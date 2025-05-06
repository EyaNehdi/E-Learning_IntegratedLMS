import { create } from "zustand";
import axios from "axios";

export const useProfileStore = create((set, get) => ({
  user: null,
  isLoadingUser: false,
  accountCompletion: 0,
  fetchUser: async () => {
    set({ isLoadingUser: true });
    try {
      // Optionally, you can manually extract token from cookies if needed
      const token = document.cookie.split('token=')[1];  // Or use your method to retrieve token

      const res = await axios.get("/api/info/profile", {
        headers: {
          "Authorization": `Bearer ${token}`, // Pass token in the Authorization header
        },
        withCredentials: true,  // Ensure cookies are sent with the request
      });
      set({ user: res.data, isLoadingUser: false });
      get().calculateAccountCompletion(res.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ user: null, isLoadingUser: false });
    }
  },
  calculateAccountCompletion: (profileData) => {
    const fields = [
      "firstName",
      "lastName",
      "email",
      "profilePhoto",
      "coverPhoto",
      "phone",
      "Bio",
    ];
    const filledFields = fields.filter((field) => profileData[field]);
    const percentage = Math.round((filledFields.length / fields.length) * 100);
    set({ accountCompletion: percentage });
  },
  toggleMFA: () => {
    set((state) => ({
      user: {
        ...state.user, mfa: {
          ...state.user.mfa,
          enabled: !state.user.mfa?.enabled,
          backupCodes: [],
        },
      },
    }));
  },
  setBackupCodes: (newBackupCodes) => {
    set((state) => ({
      user: {
        ...state.user, mfa: {
          ...state.user.mfa,
          backupCodes: newBackupCodes,
        },
      },
    }));
  },
  updateProfilePhoto: (photo) => {
    set((state) => ({
      user: { ...state.user, profilePhoto: photo },
    }));
  },
  updateCoverPhoto: (photo) => {
    set((state) => ({
      user: { ...state.user, coverPhoto: photo },
    }));
  },
  clearUser: () => set({ user: null }),
  updateUser: (updatedFields) => {
    const updatedUser = { ...get().user, ...updatedFields };
    set({ user: updatedUser });
    get().calculateAccountCompletion(updatedUser);
  },
}));
