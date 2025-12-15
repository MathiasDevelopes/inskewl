import { School, SchoolSchema } from "../types/school";
import { Endpoint } from "../endpoint";

export class SchoolApi extends Endpoint {
  async getCurrent(): Promise<School> {
    return this.client.getWithSchema("schoolinfo/current", SchoolSchema);
  }
}
