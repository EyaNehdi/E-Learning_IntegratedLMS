import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/auth";


axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,

	signup: async (firstName,lastName,email,password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/signup`, {firstName,lastName,email,password });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			set({ error: error.response.data.message || "Error signing up", isLoading: false });
			throw error;
		}
	},
	login: async (email, password) => {
        set({ isLoading: true, error: null });
    
        console.log("🟢 Sending login request:", { email, password }); // Log request data
    
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
    
            console.log("🟢 Login response:", response.data); // Log response
    
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            console.log("🔴 Login error response:", error.response?.data || error); // Log error
            set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
            throw error;
        }
    },
	logingoogle: async (email) => {
        set({ isLoading: true, error: null });
    
        console.log("🟢 Sending login request:", { email }); // Log request data
    
        try {
            const response = await axios.post(`${API_URL}/login`, { email }, { withCredentials: true });
    
            console.log("🟢 Login response:", response.data); // Log response
    
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            console.log("🔴 Login error response:", error.response?.data || error); // Log error
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
	
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
            throw error;
		}
	},
	
}));