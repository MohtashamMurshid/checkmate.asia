import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    name: v.string(),
    email: v.string(),
    useCase: v.string(),
    message: v.optional(v.string()),
    submittedAt: v.number(),
  }),
});

