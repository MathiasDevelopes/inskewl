import { api } from "./api/api";
import pkg from "../package.json" with { type: "json" };

export async function printDebugInfo(): Promise<void> {
  const loginPage = await api.loginPage.getLoginPage();

  console.group("inskewl debug info");
  console.log("Version:", pkg.version);
  console.log("Valid VIS tenant:", loginPage.validUrl);

  console.group("School info");
  console.log("School name:", loginPage.schoolInfo?.description ?? "unknown");
  console.log(
    "Identity providers:",
    loginPage.identityProviders?.identityProviders.join(", ") ?? "unknown",
  );
  console.groupEnd();

  console.groupEnd();
}
