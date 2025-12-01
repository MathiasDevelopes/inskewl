import { AcademicYear } from "../../types/calendar";
import { Session } from "../api";
import { ApiClient } from "../apiClient";

export class CalendarApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    const learnerId = await this.session.getLearnerId();

    return this.client.request<AcademicYear[]>(
      `/calendar/v2/academicyears/learner/${learnerId}`,
    );
  }
}
