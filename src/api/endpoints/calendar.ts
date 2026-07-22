import type { z, ZodType } from "zod";
import { Endpoint } from "../endpoint";

export class CalendarApi extends Endpoint {
  async getAcademicYears<S extends ZodType>(schema: S): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `calendar/v2/academicyears/learner/${learnerId}`,
      schema,
    );
  }

  async getCurrentAcademicYear<S extends ZodType<{ currentYear: boolean }[]>>(
    schema: S,
  ): Promise<z.output<S>[number]> {
    const academicYears = await this.getAcademicYears(schema);
    const currentYear = academicYears.find((year) => year.currentYear);
    if (!currentYear) {
      throw new Error("No current academic year available.");
    }
    return currentYear;
  }

  getCurrentTerm<T extends { current: boolean }>(academicYear: {
    terms: T[];
  }): T {
    const currentTerm = academicYear.terms.find((term) => term.current);
    if (!currentTerm) {
      throw new Error("No current term available.");
    }
    return currentTerm;
  }

  // Get the amount of learning days, vacation days, and planning days.
  async getDayCount<S extends ZodType>(
    academicYear: { id: number },
    schema: S,
  ): Promise<z.output<S>> {
    return this.client.getWithSchema(
      `calendar/v2/academicyears/${academicYear.id}/daycount`,
      schema,
    );
  }
}
