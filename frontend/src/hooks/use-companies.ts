import { useState, useEffect, useCallback } from "react";
import {
  api,
  type Company,
  type CreateCompanyData,
  type UpdateCompanyData,
} from "@/lib/api";

interface UseCompaniesReturn {
  companies: Company[];
  loading: boolean;
  error: string | null;
  createCompany: (data: CreateCompanyData) => Promise<void>;
  updateCompany: (id: number, data: UpdateCompanyData) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

export function useCompanies(): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to fetch companies", err);
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = useCallback(async (data: CreateCompanyData) => {
    try {
      const newCompany = await api.createCompany(data);
      setCompanies((prev) => [...prev, newCompany]);
    } catch (err) {
      throw err;
    }
  }, []);

  const updateCompany = useCallback(
    async (id: number, data: UpdateCompanyData) => {
      try {
        const updatedCompany = await api.updateCompany(id, data);
        setCompanies((prev) =>
          prev.map((company) => (company.id === id ? updatedCompany : company))
        );
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const deleteCompany = useCallback(async (id: number) => {
    try {
      await api.deleteCompany(id);
      setCompanies((prev) => prev.filter((company) => company.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  const refreshCompanies = useCallback(async () => {
    await fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    refreshCompanies,
  };
}
