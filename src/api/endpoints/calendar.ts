import {
  AcademicYear,
  AcademicYearSchema,
  DayCount,
  DayCountSchema,
} from "../types/calendar";
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

  // Get the amount of learning days, vacation days, and planning days.
  async getDayCount(academicYear: AcademicYear): Promise<DayCount> {
    return this.client.getWithSchema(
      `calendar/v2/academicyears/${academicYear.id}/daycount`,
      DayCountSchema,
    );
  }
}
