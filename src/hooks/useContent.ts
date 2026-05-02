import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBanners = () =>
  useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    staleTime: 60_000,
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useCollections = (featuredOnly = false) =>
  useQuery({
    queryKey: ["collections", featuredOnly],
    queryFn: async () => {
      let q = supabase.from("collections").select("*").eq("active", true).order("sort_order");
      if (featuredOnly) q = q.eq("featured", true);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const useProducts = (opts: { categorySlug?: string; featured?: boolean; limit?: number } = {}) =>
  useQuery({
    queryKey: ["products", opts],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*, category:categories(slug,name), collection:collections(slug,name)")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (opts.featured) q = q.eq("featured", true);
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      const filtered = opts.categorySlug
        ? (data ?? []).filter((p: any) => p.category?.slug === opts.categorySlug)
        : data ?? [];
      return filtered;
    },
  });

export const useProduct = (slug?: string) =>
  useQuery({
    enabled: !!slug,
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(slug,name), collection:collections(slug,name)")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useOffers = () =>
  useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useTestimonials = () =>
  useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials").select("*").eq("approved", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useStoreInfo = () =>
  useQuery({
    queryKey: ["store_info"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_info").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
