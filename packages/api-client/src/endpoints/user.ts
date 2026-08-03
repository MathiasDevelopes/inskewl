import type { z, ZodType } from "zod";
import { Endpoint } from "../endpoint";

export class UserApi extends Endpoint {
  async getCurrentUser<S extends ZodType>(schema: S): Promise<z.output<S>> {
    return this.client.getWithSchema("permissions/user", schema);
  }

  async getPersonalInfo<S extends ZodType>(
    schema: S,
    filterType: string = "ALL",
    filterId: number = 0,
    action: string = "current",
  ): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();
    // ?filterType=ALL&filterId=0&action=current

    return this.client.getWithSchema(`learner/${learnerId}/personal`, schema, {
      query: {
        filterType,
        filterId,
        action,
      },
    });
  }

  async getMaturity(): Promise<boolean> {
    const learnerId = await this.session.getLearnerId();

    return this.client.get<boolean>(`learner/${learnerId}/maturity`);
  }
}
