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
import { useCreateUser } from "@/hooks/api/users";
import { usePrograms } from "@/hooks/api/programs";
import { useHomes } from "@/hooks/api/homes";
import { userValidators } from "@repo/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof userValidators.createInput>;

const ROLES = [
    "EXTERNAL",
    "SOS_MEMBER",
    "SOS_AUNT",
    "EDUCATOR",
    "PSYCHOLOGIST",
    "PROGRAM_DIRECTOR",
    "NATIONAL_DIRECTOR",
] as const;

export function CreateUserDialog() {
    const [open, setOpen] = useState(false);
    const createUser = useCreateUser();

    const { data: programsData } = usePrograms({ page: 1, limit: 100 });
    const programs = programsData?.items || [];

    const { data: homesData } = useHomes({ page: 1, limit: 100 });
    const homes = homesData?.items || [];

    const form = useForm<FormValues>({
        resolver: zodResolver(userValidators.createInput),
        defaultValues: {
            name: "",
            email: "",
            role: "SOS_MEMBER",
            programId: null,
            homeId: null,
            phone: "",
        },
    });

    const onSubmit = (values: FormValues) => {
        // Ensure empty strings are treated as null/undefined for optional fields if needed by backend
        // But zod schema handles optional/nullable.
        createUser.mutate(values, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    const selectedRole = form.watch("role");
    const showProgram = ["PROGRAM_DIRECTOR", "PSYCHOLOGIST", "EDUCATOR", "SOS_AUNT", "SOS_MEMBER"].includes(selectedRole);
    const showHome = ["SOS_AUNT", "SOS_MEMBER"].includes(selectedRole);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.replace(/_/g, " ")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {(showProgram || showHome) && (
                            <FormField
                                control={form.control}
                                name="programId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Program (Optional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ?? undefined}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select program" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {programs.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {showHome && (
                            <FormField
                                control={form.control}
                                name="homeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Home (Optional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ?? undefined}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select home" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {homes.map((h) => (
                                                    <SelectItem key={h.id} value={h.id}>
                                                        {h.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Phone number" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={createUser.isPending}>
                            {createUser.isPending ? "Creating..." : "Create User"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
