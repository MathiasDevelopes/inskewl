import { Endpoint } from "../endpoint";
import { LoginPage, LoginPageSchema } from "../types/login-page";

export class LoginPageApi extends Endpoint {
  async getLoginPage(): Promise<LoginPage> {
    return this.client.getWithSchema("login-page", LoginPageSchema);
  }
}
