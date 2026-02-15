/** biome-ignore-all lint/correctness/useImageSize: no need */

import { Building, Truck } from "lucide-react";
import { Link } from "react-router";
import SignIn from "@/components/cards/auth/sign-in";

export default function Login() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden p-4">
      <div className="flex flex-col justify-center text-center">
        <a href="https://lanci.tn">
          <img alt="Lanci" src="/assets/lanci.png" width={200} />
        </a>
      </div>
      <div className="w-100">
        <SignIn />
      </div>
      <div className="mt-2 w-100">
        <div className="mb-4 text-center text-muted-foreground text-sm">
          Don't have an account?
        </div>
        <div className="flex gap-2">
          <Link className="group flex-1" to="/onboarding">
            <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md">
              <Truck className="text-foreground transition-colors group-hover:text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-sm transition-colors group-hover:text-primary lg:text-base">
                  Delivery Company
                </h3>
                <p className="mt-1 text-muted-foreground text-xs">
                  Manage your fleet, drivers, and delivery operations
                </p>
              </div>
            </div>
          </Link>
          <Link className="group flex-1" to="/business-signup">
            <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md">
              <Building className="text-foreground transition-colors group-hover:text-primary" />
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-sm transition-colors group-hover:text-primary lg:text-base">
                  Business
                </h3>
                <p className="mt-1 text-muted-foreground text-xs">
                  Request deliveries and track your orders
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
