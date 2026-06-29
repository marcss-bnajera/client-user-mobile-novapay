import { useState } from "react";
import userClient from "../../../shared/api/userClient.js";

export const useCurrencies = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const convertCurrency = async (numeroCuenta, to) => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get(`/currencies/convert/${numeroCuenta}?to=${to}`);
            const data = response.data?.data || response.data;
            setResult(data);
            setLoading(false);
            return data;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al convertir divisa");
            setLoading(false);
            throw err;
        }
    };

    return { result, loading, error, convertCurrency };
};
