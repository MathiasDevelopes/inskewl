import { Session, ApiClient, IncludeAuthProvider } from "@inskewl/api-client";

export const api = new Session(
    new ApiClient(
        new URL(`${window.location.origin}/control/`),
        new IncludeAuthProvider(),
    )
);