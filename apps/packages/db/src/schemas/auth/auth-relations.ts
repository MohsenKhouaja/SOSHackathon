import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../tables";

export const authRelations = defineRelationsPart(schema, (r) => ({
  user: {
    subscriptions: r.many.subscriptions({
      from: r.user.id,
      to: r.subscriptions.userId,
      where: { deletedAt: { isNull: true } },
    }),
    members: r.many.member({
      from: r.user.id,
      to: r.member.userId,
    }),
    teamMembers: r.many.teamMember({
      from: r.user.id,
      to: r.teamMember.userId,
    }),
  },
  member: {
    user: r.one.user({
      from: r.member.userId,
      to: r.user.id,
    }),
    organization: r.one.organization({
      from: r.member.organizationId,
      to: r.organization.id,
    }),
  },
  team: {
    organization: r.one.organization({
      from: r.team.organizationId,
      to: r.organization.id,
    }),
    teamMembers: r.many.teamMember({
      from: r.team.id,
      to: r.teamMember.teamId,
    }),
  },
  teamMember: {
    team: r.one.team({
      from: r.teamMember.teamId,
      to: r.team.id,
    }),
    user: r.one.user({
      from: r.teamMember.userId,
      to: r.user.id,
    }),
  },
  organization: {
    subscriptions: r.many.subscriptions({
      from: r.organization.id,
      to: r.subscriptions.organizationId,
      where: { deletedAt: { isNull: true } },
    }),
    organizationRoles: r.many.organizationRole({
      from: r.organization.id,
      to: r.organizationRole.organizationId,
    }),
    members: r.many.member({
      from: r.organization.id,
      to: r.member.organizationId,
    }),
    deliveryCompanies: r.one.deliveryCompanies({
      from: r.organization.id,
      to: r.deliveryCompanies.organizationId,
      where: { deletedAt: { isNull: true } },
    }),
    businesses: r.one.businesses({
      from: r.organization.id,
      to: r.businesses.organizationId,
      where: { deletedAt: { isNull: true } },
    }),
  },
  organizationRole: {
    organization: r.one.organization({
      from: r.organizationRole.organizationId,
      to: r.organization.id,
    }),
  },
}));
