# Lage en enkel modul

Denne siden viser en liten, fungerende modul fra start til slutt. Eksempelet er
ment for deg som kan litt TypeScript, men ikke kjenner modulsystemet i
`inskewl` fra før.

Modulen vi lager viser et lite panel nederst til høyre på dashboardet i VIS
InSchool. Panelet viser klokkeslettet og har en knapp som skjuler panelet.
Eksempelet er enkelt, men bruker samme struktur som de større modulene i
prosjektet.

## Filstruktur

Lag en ny mappe under `src/modules`:

```text
src/modules/simple-dashboard-note/
└── simple-dashboard-note.ts
```

## Modulfilen

Opprett `src/modules/simple-dashboard-note/simple-dashboard-note.ts`:

```typescript
import type { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";

export class SimpleDashboardNote extends VismaModule {
  name = "SimpleDashboardNote";
  description = "Shows a small note on the VIS dashboard.";

  override shouldLoad(url: string): boolean {
    return url.includes("/dashboard");
  }

  override injectables(): Injectable[] {
    let clockTimer: number | undefined;

    return [
      {
        id: "simple-dashboard-note-panel",
        target: "body",
        placement: "append",
        render: () => {
          const panel = document.createElement("aside");
          panel.setAttribute("aria-label", "inskewl demo");
          panel.style.position = "fixed";
          panel.style.right = "16px";
          panel.style.bottom = "16px";
          panel.style.zIndex = "999999";
          panel.style.width = "220px";
          panel.style.padding = "12px";
          panel.style.border = "1px solid #d0d7de";
          panel.style.borderRadius = "6px";
          panel.style.background = "#ffffff";
          panel.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.16)";
          panel.style.color = "#24292f";
          panel.style.fontFamily = "system-ui, sans-serif";
          panel.style.fontSize = "14px";

          const title = document.createElement("strong");
          title.textContent = "inskewl demo";

          const text = document.createElement("p");
          text.style.margin = "8px 0";
          text.textContent = "Denne modulen kjører på dashboardet.";

          const clock = document.createElement("p");
          clock.style.margin = "0 0 12px";

          const updateClock = () => {
            clock.textContent = `Klokken er ${new Date().toLocaleTimeString("nb-NO", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          };

          updateClock();
          clockTimer = window.setInterval(updateClock, 1000);

          const button = document.createElement("button");
          button.type = "button";
          button.textContent = "Skjul";
          button.style.cursor = "pointer";
          button.addEventListener("click", () => {
            panel.hidden = true;
          });

          panel.append(title, text, clock, button);
          return panel;
        },
        destroy: () => {
          if (clockTimer !== undefined) {
            window.clearInterval(clockTimer);
          }
        },
      },
    ];
  }
}
```

De viktigste delene er:

- `name` brukes av `DomInjector` til å holde styr på hvilke elementer modulen
  har satt inn.
- `shouldLoad(url)` bestemmer hvilke VIS-sider modulen skal være aktiv på.
- `injectables()` beskriver hvor UI skal settes inn og hvordan elementet lages.
- `destroy` rydder opp når modulen lastes ut. Her stoppes intervallet som
  oppdaterer klokken.

## Registrer modulen

For at modulen skal kjøres, må den legges til i `src/main.ts`.

Legg til importen:

```typescript
import { SimpleDashboardNote } from "./modules/simple-dashboard-note/simple-dashboard-note";
```

Legg deretter modulen inn i listen som sendes til `ModuleLoader`:

```typescript
const moduleLoader = new ModuleLoader([
  new AttendanceCalculator(),
  new TimetableExporter(),
  new SimpleDashboardNote(),
]);
```

Rekkefølgen er bare viktig hvis flere moduler prøver å endre samme del av
siden. For denne typen modul er det trygt å legge den sist.

## Kjør lokalt

Start watch-builden:

```bash
npm run dev
```

Installer eller oppdater userscriptet fra `dist/inskewl.user.js`, åpne VIS
InSchool og gå til dashboardet. Når modulen fungerer, vises panelet nederst til
høyre. Hvis du navigerer bort fra dashboardet, fjernes panelet av
`ModuleLoader`.

## Valgfritt: kall et API

Når DOM-modulen fungerer, kan du legge til API-bruk. Dette eksempelet henter
aktivt skoleår og skriver det til konsollen når modulen lastes.

API-endepunktene validerer ikke hele svaret fra VIS. I stedet gir hver modul
med sitt eget Zod-schema med akkurat feltene den trenger. Schemaet plukkes
(`pick`) fra katalog-schemaene i `packages/api-client/src/types`, slik at transformeringer
(f.eks. datoer) og feltdokumentasjon følger med.

Lag en `schemas.ts` i modulmappen:

```typescript
import { z } from "zod";
import { AcademicYearSchema } from "@inskewl/api-client";

export const MittSkoleaarSchema = z.array(
  AcademicYearSchema.pick({
    name: true,
    currentYear: true,
  }),
);
```

Legg til disse importene øverst i samme modulfil:

```typescript
import { api } from "@inskewl/api-client";
import { MittSkoleaarSchema } from "./schemas";
```

Legg deretter `onLoad` inn i `SimpleDashboardNote`-klassen:

```typescript
  override async onLoad(): Promise<void> {
    const academicYear = await api.calendar.getCurrentAcademicYear(
      MittSkoleaarSchema,
    );
    this.logger.info("Aktivt skoleår:", academicYear.name);
  }
```

API-laget bruker Zod til å validere data fra VIS InSchool. Fordelen med å
plukke bare det modulen trenger: hvis VIS endrer eller fjerner et felt modulen
ikke bruker, fortsetter den å fungere. Mangler eller endres et felt modulen
faktisk trenger, kastes en feil umiddelbart — selv om TypeScript-koden
kompilerer. Trenger du et felt som ikke finnes i katalogen ennå, legg det til i
`packages/api-client/src/types` først og plukk det deretter.

## Vanlige feil

- Panelet vises ikke: sjekk at modulen er registrert i `src/main.ts`.
- Modulen lastes aldri: logg `url` i `shouldLoad` og kontroller at URL-sjekken
  matcher siden du tester på.
- `target` finnes ikke: `DomInjector` prøver igjen ved senere DOM-endringer,
  men en for spesifikk selector kan gjøre at elementet aldri settes inn.
- API-kallet feiler: sjekk at du er logget inn i VIS InSchool og at du tester på
  riktig tenant.
