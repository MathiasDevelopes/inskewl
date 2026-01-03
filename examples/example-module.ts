import { Injectable } from "../src/modules/core/Injectable";
import { VismaModule } from "../src/modules/core/VismaModule";

export class ExampleModule extends VismaModule {
  name = "examplemodule";
  description = "Example testing module.";

  // When to load the module.
  shouldLoad(url: string): boolean {
    return url.endsWith("dashboard/");
  }

  // A list of injectables
  // Injectables are special in the way that they dont handle any logic,
  // they just specify where elements should be placed.
  injectables(): Injectable[] {
    return [
      {
        // The id of the injectable.
        // The id needs to be unique, e.g you can't have 2 injectables with the same id.
        id: "example-div",
        // The css selector of the element you want to target as a parent.
        target: "body",
        // Where to add the element in relation to the parent.
        placement: "prepend",
        // This should only contain logic that creates the element and returns it,
        // everything else is handled by the DOMInjector.
        render: () => {
          const el = document.createElement("div");
          el.textContent = "Example Div";
          el.style.position = "fixed";
          el.style.bottom = "8px";
          el.style.right = "8px";
          el.style.padding = "4px 6px";
          el.style.background = "lime";
          el.style.color = "black";
          el.style.fontSize = "12px";
          el.style.zIndex = "999999";

          el.onclick = () => alert("wow such success!");
          return el;
        },
      },
    ];
  }
}
