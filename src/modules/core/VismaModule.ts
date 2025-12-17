export abstract class VismaModule {
  abstract name: string;
  description?: string;
  abstract shouldLoad(url: string): boolean;
  abstract load(): void;
  unload?(): void;
  isLoaded = false;
}
