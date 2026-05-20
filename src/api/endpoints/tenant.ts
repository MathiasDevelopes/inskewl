import z from "zod";
import { Tenant, TenantSchema } from "../types/tenant";
import { Endpoint } from "../endpoint";

export class TenantApi extends Endpoint {
  // This endpoint is publicly accessible and requires no authentication.
  // NB: This has to be called from a tenant's url, not callable from the base url "inschool.visma.no"
  async getTenantlist(): Promise<Tenant[]> {
    return this.client.getWithSchema("tenant/list", z.array(TenantSchema));
  }
}
