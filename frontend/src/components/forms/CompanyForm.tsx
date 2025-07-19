"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  companySchema,
  type CompanyFormValues,
  defaultCompanyValues,
} from "@/lib/validations";
import { getCurrentLocation } from "@/lib/utils";
import { useCreateCompany } from "@/lib/queries";

const CompanyForm = () => {
  const [error, setError] = useState<string | null>(null);
  const createCompanyMutation = useCreateCompany();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as any,
    defaultValues: defaultCompanyValues,
    mode: "onTouched",
  });

  const handleUseLocation = async () => {
    try {
      setError(null);
      const position = await getCurrentLocation();
      setValue("latitude", position.coords.latitude, { shouldValidate: true });
      setValue("longitude", position.coords.longitude, {
        shouldValidate: true,
      });
      toast.success("Location set successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to retrieve your location.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data: CompanyFormValues) => {
    setError(null);
    try {
      await createCompanyMutation.mutateAsync(data);
      reset(defaultCompanyValues);
    } catch (err) {
      const errorMessage = "Failed to create company. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-[var(--background)] text-[var(--foreground)] rounded-2xl shadow-lg p-8 mt-8 space-y-6 border border-gray-200 dark:border-gray-800"
      aria-labelledby="company-form-title"
      role="form"
      noValidate
    >
      <h2
        id="company-form-title"
        className="text-2xl font-semibold mb-4 text-center"
      >
        Add a Company
      </h2>
      <div>
        <label htmlFor="name" className="block font-medium mb-1">
          Company Name
        </label>
        <input
          type="text"
          id="name"
          {...register("name")}
          placeholder="Company Name"
          required
          aria-required="true"
          aria-label="Company Name"
          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="industry" className="block font-medium mb-1">
          Industry
        </label>
        <input
          type="text"
          id="industry"
          {...register("industry")}
          placeholder="Industry"
          required
          aria-required="true"
          aria-label="Industry"
          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {errors.industry && (
          <p className="text-red-600 text-sm mt-1" role="alert">
            {errors.industry.message}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="latitude" className="block font-medium mb-1">
            Latitude
          </label>
          <input
            type="number"
            id="latitude"
            step="any"
            {...register("latitude", { valueAsNumber: true })}
            placeholder="Latitude"
            required
            min={-90}
            max={90}
            aria-required="true"
            aria-label="Latitude"
            aria-invalid={!!errors.latitude}
            aria-describedby={errors.latitude ? "latitude-error" : undefined}
            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={
              typeof watch === "function"
                ? watch("latitude") === 0
                  ? ""
                  : watch("latitude")
                : undefined
            }
          />
          {errors.latitude && (
            <p
              id="latitude-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {errors.latitude.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="longitude" className="block font-medium mb-1">
            Longitude
          </label>
          <input
            type="number"
            id="longitude"
            step="any"
            {...register("longitude", { valueAsNumber: true })}
            placeholder="Longitude"
            required
            min={-180}
            max={180}
            aria-required="true"
            aria-label="Longitude"
            aria-invalid={!!errors.longitude}
            aria-describedby={errors.longitude ? "longitude-error" : undefined}
            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={
              typeof watch === "function"
                ? watch("longitude") === 0
                  ? ""
                  : watch("longitude")
                : undefined
            }
          />
          {errors.longitude && (
            <p
              id="longitude-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {errors.longitude.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="address" className="block font-medium mb-1">
          Address
        </label>
        <input
          type="text"
          id="address"
          {...register("address")}
          placeholder="Address"
          aria-label="Address"
          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {errors.address && (
          <p className="text-red-600 text-sm mt-1" role="alert">
            {errors.address.message}
          </p>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={handleUseLocation}
          className="flex-1 bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-60 cursor-pointer"
          disabled={isSubmitting || createCompanyMutation.isPending}
          aria-label="Use my location"
        >
          Use my location
        </button>
        <button
          type="submit"
          disabled={isSubmitting || createCompanyMutation.isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-60 cursor-pointer"
          aria-label="Add Company"
        >
          {isSubmitting || createCompanyMutation.isPending
            ? "Adding..."
            : "Add Company"}
        </button>
      </div>
      {error && (
        <p className="text-red-600 mt-2 text-center" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};

export default CompanyForm;
