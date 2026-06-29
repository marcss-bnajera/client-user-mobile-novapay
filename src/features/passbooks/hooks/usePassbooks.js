import { useState, useEffect } from "react";
import userClient from "../../../shared/api/userClient.js";
import { useAccounts } from "../../accounts/hooks/useAccounts.js";

export const usePassbooks = () => {
    const [accountsWithPassbooks, setAccountsWithPassbooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { accounts } = useAccounts();

    useEffect(() => {
        if (accounts.length === 0) {
            setLoading(false);
            return;
        }
        const fetchPassbooks = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    accounts.map(async (acc) => {
                        try {
                            const res = await userClient.get(`/passbooks/account/${acc.id}`);
                            const passbook = res.data?.passbook || null;
                            return { ...acc, passbook };
                        } catch {
                            return { ...acc, passbook: null };
                        }
                    })
                );
                setAccountsWithPassbooks(results);
            } catch (err) {
                setError(err.response?.data?.message || "Error al cargar libretas");
            } finally {
                setLoading(false);
            }
        };
        fetchPassbooks();
    }, [accounts]);

    return { accountsWithPassbooks, loading, error };
};
