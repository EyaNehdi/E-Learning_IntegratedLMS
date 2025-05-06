import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: null,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,


	signup: async (firstName, lastName, email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/signup`, { firstName, lastName, email, password });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			set({ error: error.response.data.message || "Error signing up", isLoading: false });
			throw error;
		}
	},
	login: async (data) => {
		set({ isLoading: true, error: null });
		try {
			// const response = await axios.post(`${API_URL}/login`, { email, password, stayLoggedIn }, { withCredentials: true });
			set({
				isAuthenticated: true,
				user: data.user,
				error: null,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
			throw error;
		}
	},
	logingoogle: async (email, stayLoggedIn) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/logingoogle`, { email, stayLoggedIn }, { withCredentials: true });
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
			throw error;
		}
	},


	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},



	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });

		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			if (response.data.success) {
				set({ user: response.data.user, isAuthenticated: true, isLoading: false });
				return response.data;
			}
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},


	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},

	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`, { credentials: 'include' });
			if (response.status === 200) {
				set({
					user: response.data.user,
					isAuthenticated: true,
					isCheckingAuth: false
				});
			} else {
				set({
					isAuthenticated: false,
					isCheckingAuth: false
				});
			}
		} catch (error) {
			if (error.response?.status === 401) {
				set({
					isAuthenticated: false,
					isCheckingAuth: false,
					error: "Session expired. Please log in again."
				});
			} else {
				console.error("Authentication check failed:", error);
				set({
					isAuthenticated: false,
					isCheckingAuth: false,
					error: "An error occurred while checking authentication."
				});
			}
		}
	},
}));