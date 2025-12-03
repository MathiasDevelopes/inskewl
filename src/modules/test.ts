import { onDomReady } from "./core/DOMHelper";
import { VismaModule } from "./core/VismaModule";

export class TestModule extends VismaModule {
  name = "testmodule";
  originalColor: string = "";

  shouldLoad(url: string): boolean {
    return url.endsWith("dashboard/"); // for now
  }

  load(): void {
    onDomReady(() => {
      this.originalColor = document.body.style.backgroundColor;
      document.body.style.backgroundColor = "#ffcccc";
    });
  }

  unload(): void {
    document.body.style.backgroundColor = this.originalColor;
    console.log("test unloaded");
  }
}
