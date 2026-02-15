import { createAccessControl } from "better-auth/plugins/access";

export const ac = createAccessControl({
    admin: ["create", "read", "update", "delete"],
    user: ["read"],
});

export const roles = {
    admin: ac.newRole({
        admin: ["create", "read", "update", "delete"],
        user: ["read"],
    }),
    user: ac.newRole({
        user: ["read"],
    }),
};

export const adminAc = createAccessControl({
    admin: ["create", "read", "update", "delete"],
    user: ["read"],
});

export const adminRoles = {
    admin: adminAc.newRole({
        admin: ["create", "read", "update", "delete"],
        user: ["read"],
    }),
    user: adminAc.newRole({
        user: ["read"],
    }),
};

export type RoleKey = keyof typeof roles;
