"use client";

import dynamic from "next/dynamic";
import CompanyForm from "@/components/forms/CompanyForm";
import QueryProvider from "@/components/providers/query-provider";
import ToastProvider from "@/components/providers/toast-provider";

const CompanyMap = dynamic(() => import("@/components/maps/CompanyMap"), {
  ssr: false,
});

export default function Home() {
  return (
    <QueryProvider>
      <ToastProvider />
      <div className="max-w-screen-xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch min-h-0">
        <div className="flex items-center justify-center h-[60vh] md:h-[80vh] min-h-0 ">
          <CompanyForm />
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 h-[60vh] md:h-[80vh] min-h-0">
          <CompanyMap />
        </div>
      </div>
    </QueryProvider>
  );
}
