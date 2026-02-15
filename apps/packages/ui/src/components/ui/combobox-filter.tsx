import { Button } from "@repo/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { cn } from "@repo/ui/lib/utils";
import { Check, ChevronsUpDown, LoaderCircle, X } from "lucide-react";
import * as React from "react";
import { useDebouncedCallback } from "../../hooks/use-debounced-callback";
import Loading from "../loading/Loading";
import { Badge } from "./badge";

export type ComboBoxItemType = {
  value: string;
  label: string;
};

type ComboboxProps = {
  value?: string;
  label?: React.ReactNode;
  onSelect: (value: string, label?: string) => void;
  onUnselect?: (value: string) => void;
  items: ComboBoxItemType[];
  searchPlaceholder?: string;
  noResultsMsg?: string;
  selectItemMsg?: string | React.ReactNode;
  className?: string;
  unselect?: boolean;
  unselectMsg?: string;
  onSearchChange?: (e: string) => void;
  disabled?: boolean;
  selected?: string[];
  popoverSameWidthAsTrigger?: boolean;
  align?: "start" | "center" | "end";
  popoverContentClassName?: string;
  total?: number;
  loading?: boolean;
  loadingSelectedItem?: boolean;
  bottomRef?: React.RefObject<HTMLDivElement>;
  size?: "sm" | "md";
  selectedItemsClassName?: string;
};

const popOverStyles = {
  width: "var(--radix-popover-trigger-width)",
};

export const ComboboxFilter = React.forwardRef(
  (
    {
      value,
      label,
      onSelect,
      onUnselect,
      items,
      searchPlaceholder = "Search item...",
      noResultsMsg = "No items found",
      selectItemMsg = "Select an item",
      className,
      unselect = false,
      unselectMsg = "None",
      onSearchChange,
      disabled = false,
      selected = [],
      popoverSameWidthAsTrigger = true,
      align,
      popoverContentClassName,
      total,
      loading,
      loadingSelectedItem,
      bottomRef,
      size = "md",
      selectedItemsClassName,
    }: ComboboxProps,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const [open, setOpenState] = React.useState(false);

    const more = total ? total - items.length : 0;

    const handleOnSearchChange = useDebouncedCallback((e: string) => {
      onSearchChange?.(e);
    }, 0);

    function setOpen(isOpen: boolean) {
      if (!isOpen) handleOnSearchChange("");
      setOpenState(isOpen);
    }

    const [_items, _setItems] = React.useState<ComboBoxItemType[]>(items);

    React.useEffect(() => {
      _setItems((prev) => [
        ...prev,
        ...items.filter(
          (item) => !prev.find((prevItem) => prevItem.value === item.value)
        ),
      ]);
    }, [items]);

    return (
      <Popover modal={true} onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild className="block w-full px-3">
          <Button
            aria-expanded={open}
            className={cn(
              "flex h-fit w-full justify-between",
              size == "sm" && "h-6 px-2 text-xs",
              className
            )}
            disabled={disabled}
            ref={ref}
            role="combobox"
            type="button"
            variant="outline"
          >
            {loadingSelectedItem ? (
              <LoaderCircle className="animate-spin" />
            ) : selected && selected.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selected.length == 0 && (
                  <span className="flex items-center truncate">
                    {label || selectItemMsg}
                  </span>
                )}
                {selected.map((value) => (
                  <Badge
                    className={cn(
                      "flex gap-2 border border-border",
                      size == "sm" && "gap-1 px-1 py-0 text-[8px]",
                      selectedItemsClassName
                    )}
                    key={value}
                    variant="secondary"
                  >
                    <span className="max-w-[5.5rem] truncate">
                      {_items.find((item) => item.value === value)?.label}
                    </span>
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                        size == "sm" && "h-2.5 w-2.5"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnselect?.(value);
                      }}
                    >
                      <span className="sr-only">Remove</span>
                      <X className="!h-2.5 !w-2.5" />
                    </span>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="flex items-center truncate">
                {label || selectItemMsg}
              </span>
            )}
            <ChevronsUpDown className="shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          className={cn("p-0", popoverContentClassName)}
          style={popoverSameWidthAsTrigger ? popOverStyles : {}}
        >
          <Command shouldFilter={false}>
            <CommandInput
              className={cn(size == "sm" && "h-8 text-xs")}
              onValueChange={handleOnSearchChange}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              {!loading && <CommandEmpty>{noResultsMsg}</CommandEmpty>}
              <CommandGroup className="h-fit max-h-52 overflow-y-auto">
                {unselect && (
                  <CommandItem
                    className={cn("cursor-pointer", size == "sm" && "text-xs")}
                    key="unselect"
                    onSelect={() => {
                      onSelect("");
                      setOpen(false);
                    }}
                    value=""
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === "" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {unselectMsg}
                  </CommandItem>
                )}
                {items.map((item) => {
                  const isSelected =
                    value === item.value || selected.includes(item.value);
                  return (
                    <CommandItem
                      className={cn(
                        "cursor-pointer",
                        size == "sm" && "text-xs"
                      )}
                      disabled={isSelected}
                      key={item.value}
                      keywords={[item.label]}
                      onSelect={(value) => {
                        onSelect(value, item.label);
                        setOpen(false);
                      }}
                      value={item.value}
                    >
                      {item.label}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
                {loading && (
                  <div className="flex h-full min-h-16 items-center justify-center">
                    <Loading size="small" />
                  </div>
                )}
                <div className="h-[.1px]" ref={bottomRef} />
              </CommandGroup>
            </CommandList>
            {!!more && (
              <div className="px-3 py-2.5 text-sm opacity-50">
                {more} additional options are hidden.
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

export default ComboboxFilter;
