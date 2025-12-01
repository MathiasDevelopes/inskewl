import { api } from "./api/api";
import { School } from "./types/school";

(async function () {
  try {
    const currentSchool: School = await api.school.getCurrent();
    console.log(currentSchool);
  } catch (err) {
    console.log("ermmmm");
    console.log(err);
  }
})();
