"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import GridShape from "@/components/common/GridShape";
import { api } from "@/api";
import { toast } from "react-hot-toast";

type Step = "welcome" | "company" | "vehicle" | "finishing";

export default function OnboardingPage() {
  const { refreshAuth } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if user already has a company on mount
  React.useEffect(() => {
    const checkCompanyStatus = async () => {
      try {
        console.log("Checking company status...");
        const company = await api.companies.getMyCompany();
        console.log("Company check result:", company);
        
        if (company && company.id) {
          // User already has a company, redirect to dashboard
          toast.success("Welcome back! Redirecting to your dashboard...");
          router.push("/");
          return;
        }
        // No company found, allow onboarding
        console.log("No company, showing onboarding");
        setChecking(false);
      } catch (error) {
        // Error getting company (likely doesn't exist), allow onboarding
        console.log("Error checking company (proceeding with onboarding):", error);
        setChecking(false);
      }
    };

    // Add a timeout fallback in case the check hangs
    const timeout = setTimeout(() => {
      console.log("Company check timeout, proceeding with onboarding");
      setChecking(false);
    }, 3000);

    checkCompanyStatus().finally(() => {
      clearTimeout(timeout);
    });

    return () => clearTimeout(timeout);
  }, [router]);
  
  // Company Form States
  const [companyData, setCompanyData] = useState({
    name: "",
    registration_number: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  // Vehicle Form States
  const [vehicleData, setVehicleData] = useState({
    vehicle_number: "",
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    license_plate: "",
    fuel_type: "petrol" as "petrol" | "diesel" | "electric" | "hybrid",
  });

  const handleCompanyChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (field: string, value: string) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("vehicle");
  };

  const handleSkipVehicle = async () => {
    setLoading(true);
    try {
      // Create Company only (skip vehicle creation)
      await api.companies.createCompany({
        name: companyData.name,
        registration_number: companyData.registration_number || undefined,
        email: companyData.email || undefined,
        phone: companyData.phone || undefined,
        address: companyData.address || undefined,
        city: companyData.city || undefined,
        country: companyData.country || undefined,
        is_active: true,
      });

      setStep("finishing");
      toast.success("Onboarding completed successfully!");
      
      // Give a moment for the success state before refreshing auth and redirecting
      setTimeout(async () => {
        await refreshAuth();
        router.push("/");
      }, 2000);

    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create Company
      const company = await api.companies.createCompany({
        name: companyData.name,
        registration_number: companyData.registration_number || undefined,
        email: companyData.email || undefined,
        phone: companyData.phone || undefined,
        address: companyData.address || undefined,
        city: companyData.city || undefined,
        country: companyData.country || undefined,
        is_active: true,
      });

      // 2. Create Vehicle if data provided
      if (vehicleData.vehicle_number && vehicleData.make && vehicleData.license_plate) {
        await api.vehicles.createVehicle({
          company_id: company.id,
          vehicle_number: vehicleData.vehicle_number,
          make: vehicleData.make,
          model: vehicleData.model,
          year: parseInt(vehicleData.year),
          license_plate: vehicleData.license_plate,
          fuel_type: vehicleData.fuel_type,
          status: "available",
          current_mileage: 0,
        });
      }

      setStep("finishing");
      toast.success("Onboarding completed successfully!");
      
      // Give a moment for the success state before refreshing auth and redirecting
      setTimeout(async () => {
        await refreshAuth();
        router.push("/");
      }, 2000);

    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-white dark:bg-gray-900">
      <GridShape />
      
      {checking ? (
        <div className="mx-auto w-full max-w-[480px] text-center relative z-10">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-10 shadow-theme-xl backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full animate-pulse"></div>
                <div className="relative w-20 h-20 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Verifying account...</h3>
                <p className="text-gray-600 dark:text-gray-400">Please wait while we check your account status</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[480px] text-center sm:max-w-[540px] relative z-10">
        <div className="mb-8">
          <h1 className="mb-3 font-bold text-gray-800 text-title-md dark:text-white/90 sm:text-title-2xl">
            {step === "welcome" && "Welcome to Simple"}
            {step === "company" && "Register Your Company"}
            {step === "vehicle" && "Your First Vehicle"}
            {step === "finishing" && "All Set!"}
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">
            {step === "welcome" && "Let&apos;s get your fleet management journey started."}
            {step === "company" && "Tell us about your organization to personalize your experience."}
            {step === "vehicle" && "Add your first vehicle now, or skip this for later."}
            {step === "finishing" && "Preparing your dashboard..."}
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-theme-xl text-left backdrop-blur-sm">
          {/* Progress Indicator */}
          {step !== "finishing" && (
            <div className="flex gap-3 mb-10">
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === "welcome" || step === "company" || step === "vehicle" ? "bg-brand-500 shadow-[0_0_10px_rgba(70,128,255,0.3)]" : "bg-gray-100 dark:bg-gray-800"}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === "company" || step === "vehicle" ? "bg-brand-500 shadow-[0_0_10px_rgba(70,128,255,0.3)]" : "bg-gray-100 dark:bg-gray-800"}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === "vehicle" ? "bg-brand-500 shadow-[0_0_10px_rgba(70,128,255,0.3)]" : "bg-gray-100 dark:bg-gray-800"}`} />
            </div>
          )}

          <div>
            {/* Step 1: Welcome */}
            {step === "welcome" && (
              <div className="flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full"></div>
                  <div className="relative w-24 h-24 bg-brand-50 dark:bg-brand-500/10 rounded-[2.5rem] flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500">
                    <svg className="w-12 h-12 text-brand-500 transform -rotate-12 hover:rotate-0 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Ready for efficient fleet management?</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Simple helps you track vehicles, manage drivers, and monitor costs all in one place. Let&apos;s start by setting up your company profile.
                  </p>
                </div>
                <Button onClick={() => setStep("company")} className="w-full h-12 text-base font-medium transition-transform hover:scale-[1.02]">
                  Get Started
                </Button>
              </div>
            )}

            {/* Step 2: Company Info */}
            {step === "company" && (
              <form onSubmit={handleCompanySubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <Label>Company Name <span className="text-error-500">*</span></Label>
                    <Input 
                      type="text" 
                      value={companyData.name}
                      onChange={(e) => handleCompanyChange("name", e.target.value)}
                      placeholder="e.g. Acme Fleet Solutions"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Registration Number</Label>
                      <Input 
                        type="text" 
                        value={companyData.registration_number}
                        onChange={(e) => handleCompanyChange("registration_number", e.target.value)}
                        placeholder="e.g. REG-123456"
                      />
                    </div>
                    <div>
                      <Label>Company Phone</Label>
                      <Input 
                        type="tel" 
                        value={companyData.phone}
                        onChange={(e) => handleCompanyChange("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Company Email</Label>
                    <Input 
                      type="email" 
                      value={companyData.email}
                      onChange={(e) => handleCompanyChange("email", e.target.value)}
                      placeholder="hello@acmefleet.com"
                    />
                  </div>

                  <div>
                    <Label>Office Address</Label>
                    <Input 
                      type="text" 
                      value={companyData.address}
                      onChange={(e) => handleCompanyChange("address", e.target.value)}
                      placeholder="123 Fleet St, Suite 400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>City</Label>
                      <Input 
                        type="text" 
                        value={companyData.city}
                        onChange={(e) => handleCompanyChange("city", e.target.value)}
                        placeholder="San Francisco"
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input 
                        type="text" 
                        value={companyData.country}
                        onChange={(e) => handleCompanyChange("country", e.target.value)}
                        placeholder="USA"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 text-base font-medium transition-transform hover:scale-[1.02]">
                    Continue to Vehicle Setup
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Vehicle Info */}
            {step === "vehicle" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Skip button at the top */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSkipVehicle}
                    disabled={loading}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Skip for now
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Vehicle Make</Label>
                      <Input 
                        type="text" 
                        value={vehicleData.make}
                        onChange={(e) => handleVehicleChange("make", e.target.value)}
                        placeholder="e.g. Toyota"
                      />
                    </div>
                    <div>
                      <Label>Vehicle Model</Label>
                      <Input 
                        type="text" 
                        value={vehicleData.model}
                        onChange={(e) => handleVehicleChange("model", e.target.value)}
                        placeholder="e.g. Hilux"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>License Plate</Label>
                      <Input 
                        type="text" 
                        value={vehicleData.license_plate}
                        onChange={(e) => handleVehicleChange("license_plate", e.target.value)}
                        placeholder="e.g. ABC-1234"
                      />
                    </div>
                    <div>
                      <Label>Vehicle ID / VIN</Label>
                      <Input 
                        type="text" 
                        value={vehicleData.vehicle_number}
                        onChange={(e) => handleVehicleChange("vehicle_number", e.target.value)}
                        placeholder="Unique identifier"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Year</Label>
                      <Input 
                        type="number" 
                        value={vehicleData.year}
                        onChange={(e) => handleVehicleChange("year", e.target.value)}
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <Label>Fuel Type</Label>
                      <select 
                        value={vehicleData.fuel_type}
                        onChange={(e) => handleVehicleChange("fuel_type", e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 flex flex-col gap-4">
                  <Button 
                    onClick={handleFinalSubmit} 
                    disabled={loading}
                    className="w-full h-12 text-base font-medium transition-transform hover:scale-[1.02]"
                  >
                    {loading ? "Creating your account..." : vehicleData.vehicle_number ? "Complete Setup" : "Skip and Finish" } 
                  </Button>
                  
                  <button 
                    onClick={() => setStep("company")}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-center"
                  >
                    Go back to company details
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Finishing */}
            {step === "finishing" && (
              <div className="flex flex-col items-center space-y-8 py-8 animate-in zoom-in-95 duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-3 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Setting everything up!</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We&apos;re preparing your personal dashboard. This will only take a moment...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-sm text-center text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - Simple 
        </p>
      </div>
      )}
    </div>
  );
}