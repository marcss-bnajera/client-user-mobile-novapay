import { useState, useEffect, useCallback } from "react";
import userClient from "../../../shared/api/userClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useAuthStore((state) => state.user);

    const getFavorites = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get(`/favorites/${user.id}`);
            const data = response.data?.favorites || response.data?.data || response.data || [];
            setFavorites(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al obtener favoritos");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const addFavorite = async (formData) => {
        try {
            await userClient.post("/favorites/add", formData);
            await getFavorites();
        } catch (err) {
            throw err;
        }
    };

    const updateFavoriteAlias = async (id, data) => {
        try {
            await userClient.put(`/favorites/${id}`, data);
            await getFavorites();
        } catch (err) {
            throw err;
        }
    };

    const removeFavorite = async (id) => {
        try {
            await userClient.delete(`/favorites/${id}`);
            await getFavorites();
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        getFavorites();
    }, [getFavorites]);

    return { favorites, loading, error, getFavorites, addFavorite, updateFavoriteAlias, removeFavorite };
};
