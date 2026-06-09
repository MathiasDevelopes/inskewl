import { Endpoint } from "../endpoint";
import { ExamGroups, ExamGroupsSchema } from "../types/exams";

export class ExamsApi extends Endpoint {
  async getGroups(): Promise<ExamGroups> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `norway/exams/learner/${learnerId}/groups`,
      ExamGroupsSchema,
    );
  }
}
