import { Endpoint } from "../endpoint";
import type { z, ZodType } from "zod";

export class AssessmentApi extends Endpoint {
  async getBehaviour<S extends ZodType>(schema: S): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `assessment/behaviour/${learnerId}`,
      schema,
    );
  }

  async getRemarkLimit<S extends ZodType>(schema: S): Promise<z.output<S>> {
    return this.client.getWithSchema(`assessment/remark/limit`, schema);
  }
}
