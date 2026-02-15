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
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useCreateActionPlan } from "@/hooks/api/steps";
import { createActionPlanInput } from "@repo/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof createActionPlanInput>;

export function CreateActionPlanDialog({ reportId }: { reportId: string }) {
    const [open, setOpen] = useState(false);
    const createActionPlan = useCreateActionPlan();

    const form = useForm<FormValues>({
        resolver: zodResolver(createActionPlanInput),
        defaultValues: {
            reportId,
            proposedActions: "",
            targetDate: undefined, // Optional?
        },
    });

    const onSubmit = (values: FormValues) => {
        createActionPlan.mutate(values, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Action Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Action Plan</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="proposedActions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proposed Actions</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detail the proposed actions..."
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="targetDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Date (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={createActionPlan.isPending}>
                            {createActionPlan.isPending ? "Creating..." : "Create Plan"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
