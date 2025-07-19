const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Company {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  industry?: string;
}

export interface CreateCompanyData {
  name: string;
  industry: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface UpdateCompanyData {
  name?: string;
  industry?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status
    );
  }
  return response.json();
}

export const api = {
  // Get all companies
  async getCompanies(): Promise<Company[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/companies`);
    return handleResponse<Company[]>(response);
  },

  // Get a single company by ID
  async getCompany(id: number): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/api/v1/companies/${id}`);
    return handleResponse<Company>(response);
  },

  // Create a new company
  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/api/v1/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Company>(response);
  },

  // Update a company
  async updateCompany(id: number, data: UpdateCompanyData): Promise<Company> {
    const response = await fetch(`${API_BASE_URL}/api/v1/companies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Company>(response);
  },

  // Delete a company
  async deleteCompany(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/companies/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(response);
  },
};
