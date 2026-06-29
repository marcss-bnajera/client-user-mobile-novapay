import { useState, useEffect } from "react";
import userClient from "../../../shared/api/userClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userClient.get("/products");
            const data = response.data?.products || response.data?.data || response.data || [];
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Error al obtener productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProducts();
    }, []);

    return { products, loading, error, getProducts };
};
