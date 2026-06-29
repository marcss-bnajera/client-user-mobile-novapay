import { useState, useEffect, useCallback } from "react";
import userClient from "../../../shared/api/userClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

export const useTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useAuthStore((state) => state.user);

    const getMyTransactions = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get(`/transactions/${user.id}`);
            const data = response.data?.transactions || response.data?.data || response.data || [];
            setTransactions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al obtener transacciones");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        getMyTransactions();
    }, [getMyTransactions]);

    return { transactions, loading, error, getMyTransactions };
};
