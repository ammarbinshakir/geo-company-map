import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  api,
  type Company,
  type CreateCompanyData,
  type UpdateCompanyData,
} from "./api";

// Query keys
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters: string) => [...companyKeys.lists(), { filters }] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
};

// Get all companies
export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: api.getCompanies,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get single company
export function useCompany(id: number) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => api.getCompany(id),
    enabled: !!id,
  });
}

// Create company mutation
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createCompany,
    onSuccess: (newCompany) => {
      // Update the companies list
      queryClient.setQueryData(
        companyKeys.lists(),
        (old: Company[] | undefined) => {
          return old ? [...old, newCompany] : [newCompany];
        }
      );

      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });

      toast.success("Company created successfully!");
    },
    onError: (error) => {
      console.error("Failed to create company:", error);
      toast.error("Failed to create company. Please try again.");
    },
  });
}

// Update company mutation
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyData }) =>
      api.updateCompany(id, data),
    onSuccess: (updatedCompany) => {
      // Update the companies list
      queryClient.setQueryData(
        companyKeys.lists(),
        (old: Company[] | undefined) => {
          return old
            ? old.map((company) =>
                company.id === updatedCompany.id ? updatedCompany : company
              )
            : [updatedCompany];
        }
      );

      // Update the individual company cache
      queryClient.setQueryData(
        companyKeys.detail(updatedCompany.id),
        updatedCompany
      );

      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });

      toast.success("Company updated successfully!");
    },
    onError: (error) => {
      console.error("Failed to update company:", error);
      toast.error("Failed to update company. Please try again.");
    },
  });
}

// Delete company mutation
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteCompany,
    onSuccess: (_, deletedId) => {
      // Remove from the companies list
      queryClient.setQueryData(
        companyKeys.lists(),
        (old: Company[] | undefined) => {
          return old ? old.filter((company) => company.id !== deletedId) : [];
        }
      );

      // Remove from individual company cache
      queryClient.removeQueries({ queryKey: companyKeys.detail(deletedId) });

      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });

      toast.success("Company deleted successfully!");
    },
    onError: (error) => {
      console.error("Failed to delete company:", error);
      toast.error("Failed to delete company. Please try again.");
    },
  });
}
