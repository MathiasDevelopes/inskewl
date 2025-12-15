import { AcademicYear, AcademicYearSchema } from "../types/calendar";
import z from "zod";
import { Endpoint } from "../endpoint";

export class CalendarApi extends Endpoint {
  async getAcademicYears(): Promise<AcademicYear[]> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `calendar/v2/academicyears/learner/${learnerId}`,
      z.array(AcademicYearSchema),
    );
  }
}
