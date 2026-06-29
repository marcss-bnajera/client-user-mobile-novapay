import { useState, useCallback } from "react";
import userClient from "../../../shared/api/userClient.js";

export const useTransfers = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const makeTransfer = useCallback(async (formData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.post("/transfers", formData);
            setLoading(false);
            return response.data;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al realizar transferencia");
            setLoading(false);
            throw err;
        }
    }, []);

    return { loading, error, makeTransfer };
};
