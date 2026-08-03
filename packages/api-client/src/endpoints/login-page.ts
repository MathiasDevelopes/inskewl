import { Endpoint } from "../endpoint";
import type { z, ZodType } from "zod";

export class LoginPageApi extends Endpoint {
  async getLoginPage<S extends ZodType>(schema: S): Promise<z.output<S>> {
    return this.client.getWithSchema("login-page", schema);
  }
}
