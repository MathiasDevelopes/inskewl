import { z } from "zod";
import { ApiClient } from "./apiClient";
import { AttendanceApi } from "./endpoints/attendance";
import { CalendarApi } from "./endpoints/calendar";
import { SchoolApi } from "./endpoints/school";
import { TimetableApi } from "./endpoints/timetable";
import { UserApi } from "./endpoints/user";
import { AssessmentApi } from "./endpoints/assessment";
import { InboxApi } from "./endpoints/inbox";
import { EventsApi } from "./endpoints/events";
import { TenantApi } from "./endpoints/tenant";
import { ExamsApi } from "./endpoints/exams";
import { LoginPageApi } from "./endpoints/login-page";
import { IncludeAuthProvider } from "./providers/includeAuthProvider";

export class Session {
  private learnerId: number | null = null;

  user: UserApi;
  timetable: TimetableApi;
  calendar: CalendarApi;
  attendance: AttendanceApi;
  school: SchoolApi;
  assessment: AssessmentApi;
  inbox: InboxApi;
  events: EventsApi;
  tenant: TenantApi;
  exams: ExamsApi;
  loginPage: LoginPageApi;

  constructor(public client: ApiClient) {
    this.user = new UserApi(this.client, this);
    this.timetable = new TimetableApi(this.client, this);
    this.calendar = new CalendarApi(this.client, this);
    this.attendance = new AttendanceApi(this.client, this);
    this.school = new SchoolApi(this.client, this);
    this.assessment = new AssessmentApi(this.client, this);
    this.inbox = new InboxApi(this.client, this);
    this.events = new EventsApi(this.client, this);
    this.tenant = new TenantApi(this.client, this);
    this.exams = new ExamsApi(this.client, this);
    this.loginPage = new LoginPageApi(this.client, this);
  }

  async getLearnerId(): Promise<number> {
    if (this.learnerId != null) return this.learnerId;
    // Every feature funnels through here — validate only what we need.
    const user = await this.user.getCurrentUser(
      z.object({ learnerId: z.number() }),
    );
    this.learnerId = user.learnerId;
    return this.learnerId;
  }
}