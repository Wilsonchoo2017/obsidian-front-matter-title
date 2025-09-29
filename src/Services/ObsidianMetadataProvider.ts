import { injectable, inject } from "inversify";
import { MetadataCache, CachedMetadata } from "obsidian";
import { MetadataProviderInterface } from "@src/Interfaces/MetadataProviderInterface";
import SI from "@config/inversify.types";

@injectable()
export default class ObsidianMetadataProvider implements MetadataProviderInterface {
    constructor(
        @inject(SI["factory:metadata:cache"])
        private metadataCache: () => MetadataCache
    ) {}

    canHandle(path: string): boolean {
        return path.endsWith(".md");
    }

    getMetadata(path: string, type: string): any {
        return this.metadataCache().getCache(path)?.[type as keyof CachedMetadata];
    }
}
