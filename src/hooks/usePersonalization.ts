// ============================================================
// PERSONALIZATION HOOKS
// File: src/hooks/usePersonalization.ts
// ============================================================

import { useEffect, useState, useRef } from "react";
import {
    getOrCreateSession,
    trackSearch,
    trackProductView,
    getPersonalizedCategories,
    getPersonalizedProducts,
} from "@/lib/personalization";

// Initialize session on app load
export const useSession = () => {
    useEffect(() => {
        getOrCreateSession();
    }, []);
};

// Track product view with time spent
export const useProductTracking = (
    productId: string,
    categoryId: string | null
) => {
    const startTime = useRef(Date.now());

    useEffect(() => {
        startTime.current = Date.now();
        return () => {
            const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
            if (timeSpent > 2) {
                trackProductView(productId, categoryId, timeSpent);
            }
        };
    }, [productId, categoryId]);
};

// Get personalized categories
export const usePersonalizedCategories = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPersonalizedCategories().then((data) => {
            setCategories(data || []);
            setLoading(false);
        });
    }, []);

    return { categories, loading };
};

// Get personalized products
export const usePersonalizedProducts = (limit = 12) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPersonalizedProducts(limit).then((data) => {
            setProducts(data || []);
            setLoading(false);
        });
    }, [limit]);

    return { products, loading };
};

// Track search with debounce
export const useSearchTracking = () => {
    return (query: string, resultsCount?: number) => {
        if (query.length > 2) {
            trackSearch(query, resultsCount);
        }
    };
};