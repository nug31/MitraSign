import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
    user: null,
    profile: null,
    loading: true,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },

    fetchProfile: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) set({ profile: data });
        return { data, error };
    }
}));
