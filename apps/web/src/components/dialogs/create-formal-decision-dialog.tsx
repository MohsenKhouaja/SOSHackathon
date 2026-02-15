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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useCreateFormalDecision } from "@/hooks/api/steps";
import { createFormalDecisionInput } from "@repo/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof createFormalDecisionInput>;

export function CreateFormalDecisionDialog({ reportId }: { reportId: string }) {
    const [open, setOpen] = useState(false);
    const createDecision = useCreateFormalDecision();

    const form = useForm<FormValues>({
        resolver: zodResolver(createFormalDecisionInput),
        defaultValues: {
            reportId,
            decisionDetails: "",
            actionsTaken: "",
            finalStatus: "RESOLVED",
        },
    });

    const onSubmit = (values: FormValues) => {
        createDecision.mutate(values, {
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
                    Record Decision
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Record Formal Decision</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="decisionDetails"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Decision Details</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter final decision details..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="actionsTaken"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Actions Taken (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter actions taken..."
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="finalStatus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Final Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={createDecision.isPending}>
                            {createDecision.isPending ? "Recording..." : "Record Decision"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
