import { cn } from "@repo/ui/lib/utils";
import React from "react";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  contentClassName?: string;
}

const TablePageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ children, className, contentClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden md:overflow-auto",
          className
        )}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            "flex h-full flex-col gap-4 md:p-3 md:pt-2",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
TablePageContainer.displayName = "PageContainer";

export default TablePageContainer;
export { TablePageContainer };
