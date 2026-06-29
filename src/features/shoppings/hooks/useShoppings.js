import { useState, useEffect } from "react";
import userClient from "../../../shared/api/userClient.js";
import { useAccounts } from "../../accounts/hooks/useAccounts.js";

export const useShoppings = () => {
    const [allShoppings, setAllShoppings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { accounts } = useAccounts();

    useEffect(() => {
        if (accounts.length === 0) {
            setLoading(false);
            return;
        }
        const fetchAll = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    accounts.map(async (acc) => {
                        try {
                            const res = await userClient.get(`/shoppings?cuenta_id=${acc.id}`);
                            return res.data?.shoppings || res.data?.data || res.data || [];
                        } catch {
                            return [];
                        }
                    })
                );
                setAllShoppings(results.flat());
            } catch (err) {
                setError(err.response?.data?.message || "Error al cargar adquisiciones");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [accounts]);

    return { allShoppings, loading, error };
};
