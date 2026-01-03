import { Injectable } from "./Injectable";
import { VismaModule } from "./VismaModule";

export class DomInjector {
  private injected = new Map<string, HTMLElement>();

  inject(module: VismaModule) {
    for (const inj of module.injectables()) {
      const key = `${module.name}:${inj.id}`;

      if (this.injected.has(key)) continue;

      const target = document.querySelector(inj.target);
      if (!target) continue;

      const el = inj.render();

      switch (inj.placement) {
        case "append":
          target.appendChild(el);
          break;
        case "prepend":
          target.prepend(el);
          break;
        case "before":
          target.before(el);
          break;
        case "after":
          target.after(el);
          break;
      }

      this.injected.set(key, el);
    }
  }

  eject(module: VismaModule) {
    for (const [key, el] of this.injected) {
      if (!key.startsWith(module.name + ":")) continue;
      el.remove();
      this.injected.delete(key);
    }
  }
}
