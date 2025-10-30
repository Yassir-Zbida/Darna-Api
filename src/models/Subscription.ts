import mongoose, { Document, Schema, Types } from "mongoose";

export type SubscriptionPlan = "free" | "pro" | "premium";
export type SubscriptionStatus = "active" | "expired" | "canceled" | "pending";

export interface Subscription extends Document {
  userId: Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt: Date;
  endsAt: Date;
  isActive(): boolean;
}

const subscriptionSchema = new Schema<Subscription>(
  {
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "Users", 
        required: true, 
        index: true 
    },
    plan: { 
        type: String, 
        enum: ["free", "pro", "premium"], 
        required: true, 
        default: "free", 
        index: true 
    },
    status: { 
        type: String, 
        enum: ["active", "expired", "canceled", "pending"], 
        required: true, 
        default: "pending", 
        index: true 
    },
    startedAt: { 
        type: Date, 
        required: true, 
        default: () => new Date() 
    },
    endsAt: { 
        type: Date, 
        required: true, 
        index: true 
    }
  },
  { timestamps: true }
);


export const SubscriptionModel = mongoose.model<Subscription>("Subscriptions", subscriptionSchema);