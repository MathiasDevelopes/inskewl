import { api } from "./api/api";
import { School } from "./types/school";

(async function () {
  try {
    const currentSchool: School = await api.school.getCurrent();
    console.log(currentSchool);

    const maturity: boolean = await api.user.getMaturity();
    console.log(`is maturity: ${maturity}`);
  } catch (err) {
    console.log("ermmmm");
    console.log(err);
  }
})();
