import type { Injectable } from "./Injectable";
import type { VismaModule } from "./VismaModule";

interface InjectedElement {
  el: HTMLElement;
  inj: Injectable;
}

export class DomInjector {
  private injected = new Map<string, InjectedElement>();

  inject(module: VismaModule) {
    for (const inj of module.injectables()) {
      const key = `${module.name}:${inj.id}`;

      if (this.injected.has(key)) {
        const injected = this.injected.get(key);
        if (injected && document.contains(injected.el)) {
          continue;
        } else {
          if (injected) {
            try {
              this.destroyInjected(injected);
            } finally {
              this.injected.delete(key);
            }
          } else {
            this.injected.delete(key);
          }
        }
      }

      const target = document.querySelector(inj.target);
      if (!target) {
        continue;
      }

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

      this.injected.set(key, { el, inj });
    }
  }

  eject(module: VismaModule) {
    for (const [key, injected] of this.injected) {
      if (!key.startsWith(module.name + ":")) continue;
      try {
        this.destroyInjected(injected);
      } finally {
        this.injected.delete(key);
      }
    }
  }

  private destroyInjected(injected: InjectedElement): void {
    try {
      injected.inj.destroy?.(injected.el);
    } finally {
      injected.el.remove();
    }
  }
}
