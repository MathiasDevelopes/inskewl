import { AcademicYear, AcademicYearSchema } from "../types/calendar";
import { Session } from "../api";
import { ApiClient } from "../apiClient";
import z from "zod";

export class CalendarApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    const learnerId = await this.session.getLearnerId();

    return this.client.requestWithSchema(
      `/calendar/v2/academicyears/learner/${learnerId}`,
      z.array(AcademicYearSchema),
    );
  }
}
