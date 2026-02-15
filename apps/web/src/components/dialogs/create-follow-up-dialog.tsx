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
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useCreateFollowUp } from "@/hooks/api/steps";
import { createFollowUpInput } from "@repo/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof createFollowUpInput>;

export function CreateFollowUpDialog({ reportId }: { reportId: string }) {
    const [open, setOpen] = useState(false);
    const createFollowUp = useCreateFollowUp();

    const form = useForm<FormValues>({
        resolver: zodResolver(createFollowUpInput),
        defaultValues: {
            reportId,
            followUpNotes: "",
            isResolved: false,
        },
    });

    const onSubmit = (values: FormValues) => {
        createFollowUp.mutate(values, {
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
                    Add Follow Up
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Follow Up</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="followUpNotes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter follow up notes..."
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
                            name="isResolved"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Mark as Resolved
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={createFollowUp.isPending}>
                            {createFollowUp.isPending ? "Submitting..." : "Submit Follow Up"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
