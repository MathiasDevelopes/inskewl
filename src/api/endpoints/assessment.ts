import { Endpoint } from "../endpoint";
import {
  Behaviour,
  BehaviourSchema,
  RemarkLimit,
  RemarkLimitSchema,
} from "../types/assessment";

export class AssessmentApi extends Endpoint {
  async getBehaviour(): Promise<Behaviour> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `/assessment/behaviour/${learnerId}`,
      BehaviourSchema,
    );
  }

  async getRemarkLimit(): Promise<RemarkLimit> {
    return this.client.getWithSchema(
      `/assessment/remark/limit`,
      RemarkLimitSchema,
    );
  }
}
