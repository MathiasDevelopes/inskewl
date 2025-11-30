import { ApiClient } from "./apiClient";
import { UserApi } from "./endpoints/user";

// fungerer kun i fanen med visma...
const client: ApiClient = new ApiClient(`${window.location.origin}/control`);

export const api = {
  user: new UserApi(client),
};
