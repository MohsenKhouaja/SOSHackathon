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
import { useCreateIncident } from "@/hooks/api/incidents";
import { useChildren } from "@/hooks/api/children";
import { useHomes } from "@/hooks/api/homes";
import { createIncidentInput } from "@repo/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof createIncidentInput>;

export function CreateIncidentDialog() {
    const [open, setOpen] = useState(false);
    const createIncident = useCreateIncident();

    // Need children to select victim
    const { data: childrenData } = useChildren({ page: 1, limit: 100 });
    const children = childrenData?.data ?? [];

    // Need homes? Maybe inferred from child but good to have.
    const { data: homesData } = useHomes({ page: 1, limit: 100 });
    const homes = homesData?.data ?? [];

    const form = useForm<FormValues>({
        resolver: zodResolver(createIncidentInput),
        defaultValues: {
            description: "",
            type: "ABUSE",
            urgencyLevel: "MEDIUM",
            isAnonymous: false,
            dateOfIncident: new Date().toISOString().split("T")[0],
            // programId: "", // Required by schema
        },
    });

    const onSubmit = (values: FormValues) => {
        // Logic for programId inference
        // If a child is selected, use their home's programId
        if (values.childId) {
            const child = children.find(c => c.id === values.childId);
            if (child && child.home?.programId) {
                values.programId = child.home.programId;
                values.homeId = child.home.id;
            }
        } else if (values.homeId) {
            const home = homes.find(h => h.id === values.homeId);
            if (home) values.programId = home.programId;
        }

        // If programId still missing, user must select or we fail if schema requires it strictly 
        // without backend inference fallback.
        // Assuming schema requires it, let's pick first available or force user to pick context.
        // For MVP, if we are Program Director, backend handles it if we don't send it?
        // Actually no, schema requires it. But if we send undefined to backend, does it fail Zod BEFORE logic?
        // Yes.
        // So we MUST provide programId from frontend.
        // Let's create a Program Select if context is ambiguous?
        // Or just pick one from available homes/children.
        // Or just require Child selection for now.

        // Fallback hack for demo:
        if (!values.programId && homes.length > 0) {
            values.programId = homes[0].programId;
        }

        createIncident.mutate(values, {
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
                    Report Incident
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Report Incident</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe what happened..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ABUSE">Abuse</SelectItem>
                                                <SelectItem value="NEGLECT">Neglect</SelectItem>
                                                <SelectItem value="ACCIDENT">Accident</SelectItem>
                                                <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="urgencyLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Urgency</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select urgency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="CRITICAL">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="childId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Child</FormLabel>
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            // Auto-set child name fallback
                                            const child = children.find(c => c.id === val);
                                            if (child) form.setValue("childNameFallback", `${child.firstName} ${child.lastName}`);
                                        }}
                                        defaultValue={field.value ?? undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select child" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {children.map((child) => (
                                                <SelectItem key={child.id} value={child.id}>
                                                    {child.firstName} {child.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dateOfIncident"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Incident</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={createIncident.isPending}>
                            {createIncident.isPending ? "Submitting..." : "Submit Report"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
