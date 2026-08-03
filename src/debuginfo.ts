import { api } from "@inskewl/api-client";
import { LoginPageSchema } from "@inskewl/api-client";
import { version } from "../package.json" with { type: "json" };

export async function printDebugInfo(): Promise<void> {
  console.group("inskewl debug info");
  console.log("Version:", version);

  try {
    const loginPage = await api.loginPage.getLoginPage(LoginPageSchema);

    console.log("Valid VIS tenant:", loginPage.validUrl);

    console.group("School info");
    console.log("School name:", loginPage.schoolInfo?.description ?? "unknown");
    console.log(
      "Identity providers:",
      loginPage.identityProviders?.identityProviders.join(", ") ?? "unknown",
    );
    console.groupEnd();
  } catch (error) {
    console.error("Failed to fetch login page debug info:", error);
  } finally {
    console.groupEnd();
  }
}
