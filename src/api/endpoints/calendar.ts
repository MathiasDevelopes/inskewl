import {
  AcademicYear,
  AcademicYearSchema,
  DayCount,
  DayCountSchema,
  type Term,
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

  async getCurrentAcademicYear(): Promise<AcademicYear> {
    const academicYears = await this.getAcademicYears();
    const currentYear = academicYears.find((year) => year.currentYear);
    if (!currentYear) {
      throw new Error("No current academic year available.");
    }
    return currentYear;
  }

  getCurrentTerm(academicYear: AcademicYear): Term {
    const currentTerm = academicYear.terms.find((term) => term.current);
    if (!currentTerm) {
      throw new Error("No current term available.");
    }
    return currentTerm;
  }

  // Get the amount of learning days, vacation days, and planning days.
  async getDayCount(academicYear: AcademicYear): Promise<DayCount> {
    return this.client.getWithSchema(
      `calendar/v2/academicyears/${academicYear.id}/daycount`,
      DayCountSchema,
    );
  }
}
