// components/TopBarFilters.tsx

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { RoleEnum } from "@shared/types/Role";
import type { StatusValidator } from "@shared/validators/statuses-validator";
import { AnimatePresence, motion } from "framer-motion";
import { type LucideIcon, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAdminAuthenticatedUserQuery } from "@/api/queries/admin-auth-queries";

type TopBarFiltersProps = {
  statuses?: StatusValidator[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  search: string;
  setSearch: (value: string) => void;
  createPath?: string;
  isLoading?: boolean;
  Icon: LucideIcon;
  buttonText?: string;
};

const TopBarFilters = ({
  statuses,
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  createPath = "/processes/pickups/create",
  isLoading = false,
  Icon,
  buttonText,
}: TopBarFiltersProps) => {
  const [showFilters, setShowFilters] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { data: ctx } = useAdminAuthenticatedUserQuery();
  const isDeliveryAgent = ctx?.user?.role === RoleEnum.delivery_agent;
  const isDispatcher = ctx?.user?.role === RoleEnum.dispatcher;
  const location = useLocation();
  const isOnPickupsPage = location.pathname.includes("/processes/pickups");

  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto pb-1">
      {/* FILTER TOGGLE BUTTON */}
      <Button
        className="h-8 w-8 shrink-0"
        onClick={() => {
          setShowFilters((prev) => !prev);
          setShowSearch(false);
        }}
        size="icon"
        variant="outline"
      >
        <SlidersHorizontal />
      </Button>

      {/* FILTER TAGS */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            animate={{ opacity: 1, width: "auto" }}
            className="no-scrollbar flex gap-4 overflow-x-auto"
            exit={{ opacity: 0, width: 0 }}
            initial={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isLoading || !statuses ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    className="flex shrink-0 animate-pulse items-center gap-1 rounded bg-muted px-3"
                    key={i}
                  >
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <div className="h-4 w-16 rounded bg-muted-foreground/30" />
                  </div>
                ))}
              </div>
            ) : (
              statuses.map((status) => {
                const isActive = statusFilter === status.statusId;

                // return (
                //     <Status
                //         status="offline"
                //         key={status.statusId}
                //         className={q
                //             isActive
                //                 ? "bg-primary text-white"
                //                 : "bg-muted text-muted-foreground hover:bg-accent"
                //         }
                //         onClick={() => setStatusFilter(isActive ? "" : status.statusId)}
                //     >
                //         <StatusIndicator indicatorColor={status.color} />
                //         <StatusLabel className="truncate whitespace-nowrap">{status.name}</StatusLabel>
                //     </Status>
                // );
                return (
                  <button
                    className={cn(
                      "flex h-8 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-3 py-1 text-sm transition-all",
                      "min-w-[100px]",
                      "max-w-auto",
                      isActive
                        ? "bg-gray-300"
                        : "border-1 border-gray-200 text-muted-foreground hover:bg-accent"
                    )}
                    key={status.statusId}
                    onClick={() =>
                      setStatusFilter(isActive ? "" : status.statusId)
                    }
                    type="button"
                  >
                    {/* <StatusDot color={status.color} size="small" /> */}
                    <span className="relative flex h-2 w-2">
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                        )}
                        style={{ backgroundColor: status.color }}
                      />
                      <span
                        className={cn(
                          "relative inline-flex h-2 w-2 rounded-full"
                        )}
                        style={{ backgroundColor: status.color }}
                      />
                    </span>
                    <span className="truncate">{status.name}</span>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH TOGGLE BUTTON */}
      <Button
        className="h-8 w-8 shrink-0"
        onClick={() => {
          setShowSearch((prev) => !prev);
          setShowFilters(false);
        }}
        size="icon"
        variant="outline"
      >
        <Search />
      </Button>

      {/* SEARCH INPUT */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            animate={{ opacity: 1, width: "auto" }}
            className="overflow-hidden"
            exit={{ opacity: 0, width: 0 }}
            initial={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Input
              className="h-8 min-w-[200px] max-w-[220px] shrink-0"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              type="text"
              value={search}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD BUTTON */}
      {!(isDeliveryAgent || (isDispatcher && isOnPickupsPage)) && (
        <Button
          className="h-8 w-fit shrink-0 bg-black px-3 py-2 text-white hover:bg-gray-800"
          onClick={() => navigate(createPath)}
          size="icon"
        >
          <Icon className="h-4 w-4" />
          {buttonText && <span>{buttonText}</span>}
        </Button>
      )}
    </div>
  );
};

export default TopBarFilters;
