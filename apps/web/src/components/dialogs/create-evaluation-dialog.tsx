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
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useCreateEvaluation } from "@/hooks/api/steps";
import { createEvaluationInput } from "@repo/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof createEvaluationInput>;

export function CreateEvaluationDialog({ reportId }: { reportId: string }) {
    const [open, setOpen] = useState(false);
    const createEvaluation = useCreateEvaluation();

    const form = useForm<FormValues>({
        resolver: zodResolver(createEvaluationInput),
        defaultValues: {
            reportId,
            evaluationDetails: "",
            // completedBy: "", // Inferred from context?
            // Validators: completedBy is optional?
            // Schema says: completedBy: text("completed_by").references(() => user.id)
            // Input: z.string().optional() ?
            // Let's check validators. Assuming inferred or optional.
        },
    });

    const onSubmit = (values: FormValues) => {
        createEvaluation.mutate(values, {
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
                    Add Evaluation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Psychological Evaluation</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="evaluationDetails"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Evaluation Details</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter evaluation details..."
                                            className="min-h-[150px]"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={createEvaluation.isPending}>
                            {createEvaluation.isPending ? "Submitting..." : "Submit Evaluation"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
