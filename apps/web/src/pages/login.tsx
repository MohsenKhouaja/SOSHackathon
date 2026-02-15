/** biome-ignore-all lint/correctness/useImageSize: no need */

import { ShieldAlert } from "lucide-react";
import { Link } from "react-router";
import SignIn from "@/components/cards/auth/sign-in";

export default function Login() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden bg-slate-50 p-4">
      {/* Platform Branding */}
      <div className="flex flex-col items-center justify-center text-center gap-2">
        <a href="https://www.sos-childrensvillages.org/" target="_blank" rel="noreferrer">
          {/* Replace src with your actual Hack for Hope / SOS Villages logo */}
          <div className="flex h-16 items-center justify-center">
            <h1 className="text-2xl font-bold text-primary">SOS Children's Villages</h1>
          </div>
        </a>
        <p className="text-sm font-medium text-muted-foreground">
          Protection Platform • Secure Access
        </p>
      </div>

      {/* Internal Staff Auth */}
      <div className="w-full max-w-md">
        <SignIn />
      </div>

      {/* External Public Reporting Pathway */}
      <div className="mt-4 w-full max-w-md">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-2 text-muted-foreground">
              External Reporting
            </span>
          </div>
        </div>

        <Link className="group block w-full" to="/submit-report">
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-destructive/20 bg-card p-4 transition-all hover:border-destructive hover:shadow-md">
            <div className="rounded-full bg-destructive/10 p-3">
              <ShieldAlert className="h-6 w-6 text-destructive transition-colors" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground text-sm transition-colors group-hover:text-destructive lg:text-base">
                Submit an Incident Report
              </h3>
              <p className="mt-1 text-muted-foreground text-xs">
                For external members, teachers, or medical staff to report a child welfare concern. No account required.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
