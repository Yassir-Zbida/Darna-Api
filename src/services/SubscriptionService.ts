import { ClientSession, Types } from "mongoose";
import { SubscriptionModel, Subscription, SubscriptionPlan } from "../models/Subscription";

type CreatePlanInput = {
  userId: string | Types.ObjectId;
  plan: SubscriptionPlan; 
  durationDays?: number;
  activate?: boolean;
  expirePreviousActive?: boolean;
};

export class SubscriptionService {
  static async createPlan(input: CreatePlanInput, session: ClientSession | null = null): Promise<Subscription> {
    const {
      userId,
      plan,
      durationDays = 30,
      activate = true,
      expirePreviousActive = true
    } = input;

    // 1) Validation basique
    if (!userId) throw new Error("userId requis");
    
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const status = activate ? "active" : "pending";

    // Prépare les options de requête avec session seulement si définie
    const queryOptions = session ? { session } : undefined;

    // 2) Optionnel: expirer l’ancien abonnement actif
    if (expirePreviousActive) {
      await SubscriptionModel.updateMany(
        { userId, status: { $in: ["active", "pending"] } },
        { $set: { status: "expired", endsAt: now } },
        queryOptions
      );
    } else {
      // Si on ne force pas l’expiration, on s’assure qu’il n’existe pas déjà un actif/pending
      const existing = await SubscriptionModel.findOne(
        { userId, status: { $in: ["active", "pending"] } },
        null,
        queryOptions
      );
      if (existing) {
        throw new Error("Un abonnement actif/pending existe déjà pour cet utilisateur");
      }
    }

    // 3) Création
    const createdArray = await SubscriptionModel.create(
      [
        {
          userId,
          plan,
          status,
          startedAt: now,
          endsAt
        }
      ],
      queryOptions
    );

    const created = createdArray[0];
    if (!created) {
      throw new Error("Échec de la création de l'abonnement");
    }
    return created;
  }
}