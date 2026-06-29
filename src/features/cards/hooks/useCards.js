import { useState, useEffect, useCallback } from "react";
import userClient from "../../../shared/api/userClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";
import { useAccounts } from "../../accounts/hooks/useAccounts.js";

export const useCards = () => {
    const [accountsWithCards, setAccountsWithCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { accounts, getMyAccounts } = useAccounts();

    useEffect(() => {
        if (accounts.length === 0) {
            setLoading(false);
            return;
        }
        const fetchCards = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    accounts.map(async (acc) => {
                        try {
                            const res = await userClient.get(`/cards/account/${acc.id}`);
                            const cards = res.data?.cards || res.data?.data || res.data || [];
                            return { ...acc, cards: Array.isArray(cards) ? cards : [] };
                        } catch {
                            return { ...acc, cards: [] };
                        }
                    })
                );
                setAccountsWithCards(results);
            } catch (err) {
                setError(err.response?.data?.message || "Error al cargar tarjetas");
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, [accounts]);

    return { accountsWithCards, loading, error, getMyAccounts };
};
