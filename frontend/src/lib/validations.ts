import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  latitude: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .refine((val) => !isNaN(val), { message: "Latitude is required" })
  ),
  longitude: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .refine((val) => !isNaN(val), { message: "Longitude is required" })
  ),
  address: z.string().optional(),
});

export type CompanyFormValues = {
  name: string;
  industry: string;
  latitude: number;
  longitude: number;
  address?: string;
};

export const defaultCompanyValues: CompanyFormValues = {
  name: "",
  industry: "",
  latitude: 0,
  longitude: 0,
  address: "",
};
