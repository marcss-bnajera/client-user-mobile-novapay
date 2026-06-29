import { useState, useEffect, useCallback } from "react";
import userClient from "../../../shared/api/userClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

export const useUsers = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const authUser = useAuthStore((state) => state.user);

    const getProfile = useCallback(async () => {
        if (!authUser?.id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get(`/users/${authUser.id}`);
            const data = response.data?.user || response.data?.data || response.data;
            setUser(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al obtener el perfil");
        } finally {
            setLoading(false);
        }
    }, [authUser?.id]);

    const updateProfile = useCallback(async (formData) => {
        if (!authUser?.id) return;
        try {
            setLoading(true);
            setError(null);
            await userClient.put(`/users/${authUser.id}`, formData);
            await getProfile();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al actualizar el perfil");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [authUser?.id, getProfile]);

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    return { user, loading, error, getProfile, updateProfile };
};
