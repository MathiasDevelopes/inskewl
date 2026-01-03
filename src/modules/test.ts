import { Injectable } from "./core/Injectable";
import { VismaModule } from "./core/VismaModule";

export class TestModule extends VismaModule {
  name = "testmodule";
  description = "Test the module system works.";

  shouldLoad(url: string): boolean {
    return url.endsWith("dashboard/"); // for now
  }

  injectables(): Injectable[] {
    return [
      {
        id: "testing-div",
        target: "body",
        placement: "append",
        render: () => {
          const el = document.createElement("div");
          el.textContent = "TESTING";
          el.style.position = "fixed";
          el.style.bottom = "8px";
          el.style.right = "8px";
          el.style.padding = "4px 6px";
          el.style.background = "lime";
          el.style.color = "black";
          el.style.fontSize = "12px";
          el.style.zIndex = "999999";
          return el;
        },
      },
    ];
  }
}
