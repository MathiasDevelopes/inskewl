import { User } from "../types/user";
import { ApiClient } from "./apiClient";
import { TimetableApi } from "./endpoints/timetable";
import { UserApi } from "./endpoints/user";

// fungerer kun i fanen med visma...
const client: ApiClient = new ApiClient(`${window.location.origin}/control`);

export class Session {
  private learnerId: number | null = null;

  user: UserApi;
  timetable: TimetableApi;

  constructor(public client: ApiClient) {
    this.user = new UserApi(this.client, this);
    this.timetable = new TimetableApi(this.client, this);
  }

  async getLearnerId(): Promise<number> {
    if (this.learnerId != null) return this.learnerId;
    const user: User = await this.client.request<User>("/permissions/user");
    this.learnerId = user.learnerId;
    return this.learnerId;
  }
}

export const api = new Session(client);
