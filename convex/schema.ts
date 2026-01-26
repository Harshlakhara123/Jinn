import { defineSchema , defineTable }  from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    projects: defineTable({
        name: v.string(),
        ownerId: v.string(),
        importantstatus: v.optional(
            v.union(
                v.literal("importing"),
                v.literal("completed"),
                v.literal("failed"),
            )
        ),
    }).index("byOwner", ["ownerId"]),
})