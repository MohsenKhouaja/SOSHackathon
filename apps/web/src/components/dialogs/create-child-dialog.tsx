import { Button } from "@repo/ui/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useCreateChild } from "@/hooks/api/children";
import { useHomes } from "@/hooks/api/homes";
import { createChildInput } from "@repo/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// We need to import the schema type to infer form correctly, 
// but createChildInput is a Zod schema object.
type FormValues = z.infer<typeof createChildInput>;

export function CreateChildDialog() {
    const [open, setOpen] = useState(false);
    const createChild = useCreateChild();

    // Fetch homes for selection
    const { data: homesData } = useHomes({ page: 1, limit: 100 });
    const homes = homesData?.data ?? [];

    const form = useForm<FormValues>({
        resolver: zodResolver(createChildInput),
        defaultValues: {
            firstName: "",
            lastName: "",
            dateOfBirth: "", // Date picker usually returns Date or string. Input type="date" returns string yyyy-mm-dd
            gender: "MALE",
            programId: "", // Will be set automatically by backend if not provided? 
            // Wait, validators might require programId. 
            // The backend service infers programId from user context if not provided?
            // Let's check validators. 
            // createChildInput: programId is uuid().
            // If user is Program Director, they have programId.
            // If user is National Director, they might need to select Program?
            // For now, let's assume the backend handles it or we handle it if required.
            // Actually, standard is to let backend handle it if implicit.
            // But Zod schema says `programId: z.string().uuid()`.
            // If it is required in Zod, we MUST provide it.
            // BUT, if the backend service overrides it with ctx.user.programId, 
            // we might need to pass a dummy or fetch current user's program.
            // Let's rely on the fact that if it's required, we need a way to get it.
        },
    });

    const onSubmit = (values: FormValues) => {
        // We need to ensure dateOfBirth is ISO string or Date object as expected by Zod/Backend.
        // validator says: dateOfBirth: z.string().or(z.date()).

        // If programId is required but we don't have it in form (e.g. inferred), 
        // we might need to handle it. 
        // For now, let's assume the user selects a Home, and we can get Program ID from Home? 
        // Or we need to fetch Programs.

        // Let's assume for this MVP, we pick the first program or hardcode if we are testing with a specific user.
        // Or better, make programId optional in Zod if inferred? 
        // I already implemented it as required in schema.

        // Quick fix: Fetch programs and select one, or rely on hardcoded for now if simpler.
        // Ideally, `createChild` should take context.

        // Wait, the hook `useCreateChild` calls `trpc.children.create`.
        // The service `create` function:
        // `const programId = user.programId ?? input.programId;`
        // So if user has `programId`, `input.programId` is fallback or ignored? 
        // `if (!programId) throw ...`
        // So if user has programId, input is optional in logic, but Zod might enforce it.
        // The Zod schema `createChildInput` defined in `validators/src/child/index.ts`:
        // `programId: z.string().uuid()` -> It IS required.
        // I should make it optional in Zod if I want to infer it.
        // Or I pass a dummy UUID if I know the backend ignores it for restricted users.
        // Let's pass a known Program ID from the Home selected? 
        // Homes have programId.

        const selectedHome = homes.find(h => h.id === values.homeId);
        if (selectedHome) {
            values.programId = selectedHome.programId;
        }

        createChild.mutate(values, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Child
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Child</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="homeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Home</FormLabel>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            // Also set program ID if possible?
                                            // Can't easily set other field here without `form.setValue`
                                            const selectedHome = homes.find(h => h.id === val);
                                            if (selectedHome) {
                                                form.setValue("programId", selectedHome.programId);
                                            }
                                        }}
                                        defaultValue={field.value ?? undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select home" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {homes.map((home) => (
                                                <SelectItem key={home.id} value={home.id}>
                                                    {home.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={createChild.isPending}>
                            {createChild.isPending ? "Creating..." : "Create Child"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
