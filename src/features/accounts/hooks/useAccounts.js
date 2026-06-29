import { useState, useEffect, useCallback } from "react";
import userClient from "../../../shared/api/userClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

export const useAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useAuthStore((state) => state.user);

    const getMyAccounts = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get(`/accounts/${user.id}`);
            const data = response.data?.accounts || response.data?.data || response.data || [];
            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al obtener cuentas");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        getMyAccounts();
    }, [getMyAccounts]);

    return { accounts, loading, error, getMyAccounts };
};
