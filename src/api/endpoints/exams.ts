import { Endpoint } from "../endpoint";
import type { z, ZodType } from "zod";

export class ExamsApi extends Endpoint {
  async getGroups<S extends ZodType>(schema: S): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `norway/exams/learner/${learnerId}/groups`,
      schema,
    );
  }
}
