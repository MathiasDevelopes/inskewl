import { User } from "../../types/user";
import { ApiClient, Method } from "../apiClient";

export class UserApi {
  private client: ApiClient;
  private learnerId: number | null;

  constructor(client: ApiClient) {
    this.learnerId = null;
    this.client = client;
  }

  // Almost every api call related to user requires learner id, so we cache it here.
  private async ensureLearnerId(): Promise<number> {
    if (this.learnerId != null) return this.learnerId;
    const user = await this.client.request<User>("/permissions/user");
    this.learnerId = user.learnerId;
    return this.learnerId;
  }

  async getCurrentUser(): Promise<User> {
    return this.client.request("/permissions/user", {
      method: Method.GET,
    });
  }
}
