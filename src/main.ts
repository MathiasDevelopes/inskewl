import { api } from "./api/api";
import { User } from "./types/user";

(async function () {
  try {
    const currentUser: User = await api.user.getCurrentUser();
    console.log(`fant bruker...`);
    console.log(currentUser);
  } catch (err) {
    console.log("ermmmm");
    console.log(err);
  }
})();
