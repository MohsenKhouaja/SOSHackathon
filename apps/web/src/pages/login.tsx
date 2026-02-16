/** biome-ignore-all lint/correctness/useImageSize: no need */

import { ShieldAlert } from "lucide-react";
import { Link } from "react-router";
import SignIn from "@/components/cards/auth/sign-in";

export default function Login() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      
      {/* Subtle Background Gradient (Safely behind everything) */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200/50 via-slate-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />

      {/* Main Content Wrapper (Forced to front to guarantee clickability) */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        
        {/* Platform Branding */}
        <div className="flex flex-col items-center justify-center text-center">
          <a
            href="https://www.sos-childrensvillages.org/"
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950"
          >
            <div className="flex h-16 items-center justify-center rounded-2xl bg-primary/5 px-6 dark:bg-primary/10">
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                SOS Children's Villages
              </h1>
            </div>
          </a>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Protection Platform • Secure Access
          </p>
        </div>

        {/* Internal Staff Auth */}
        <div className="relative z-20 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SignIn />
        </div>

        {/* External Public Reporting Pathway */}
        <div className="relative z-20 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Separator */}
          <div className="relative mb-6 mt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider">
              <span className="bg-slate-50 px-4 text-muted-foreground dark:bg-slate-950">
                External Reporting
              </span>
            </div>
          </div>

          {/* Action Card */}
          <Link
            className="group block w-full rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
            to="/submit-report"
          >
            <div className="relative flex items-center gap-4 overflow-hidden rounded-xl border border-destructive/20 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-destructive/40 hover:shadow-md dark:bg-slate-900">
              {/* Subtle hover background glow */}
              <div className="absolute inset-0 bg-destructive/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Icon Container */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 transition-transform duration-300 group-hover:scale-110">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>

              {/* Text Content */}
              <div className="relative flex-1 text-left">
                <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-destructive sm:text-base">
                  Submit an Incident Report
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  For external members, teachers, or medical staff to report a child welfare concern. No account required.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}