import { User } from "./types/user";
import { ApiClient } from "./apiClient";
import { AttendanceApi } from "./endpoints/attendance";
import { CalendarApi } from "./endpoints/calendar";
import { SchoolApi } from "./endpoints/school";
import { TimetableApi } from "./endpoints/timetable";
import { UserApi } from "./endpoints/user";
import { AssessmentApi } from "./endpoints/assessment";
import { InboxApi } from "./endpoints/inbox";
import { EventsApi } from "./endpoints/events";

// fungerer kun i fanen med visma...
const client: ApiClient = new ApiClient(
  new URL(`${window.location.origin}/control/`),
);

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

  constructor(public client: ApiClient) {
    this.user = new UserApi(this.client, this);
    this.timetable = new TimetableApi(this.client, this);
    this.calendar = new CalendarApi(this.client, this);
    this.attendance = new AttendanceApi(this.client, this);
    this.school = new SchoolApi(this.client, this);
    this.assessment = new AssessmentApi(this.client, this);
    this.inbox = new InboxApi(this.client, this);
    this.events = new EventsApi(this.client, this);
  }

  async getLearnerId(): Promise<number> {
    if (this.learnerId != null) return this.learnerId;
    const user: User = await this.user.getCurrentUser();
    this.learnerId = user.learnerId;
    return this.learnerId;
  }
}

export const api = new Session(client);
