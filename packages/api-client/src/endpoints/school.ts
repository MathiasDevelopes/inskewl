import { Endpoint } from "../endpoint";
import type { z, ZodType } from "zod";

export class SchoolApi extends Endpoint {
  async getCurrent<S extends ZodType>(schema: S): Promise<z.output<S>> {
    return this.client.getWithSchema("schoolinfo/current", schema);
  }
}
