import { injectable, multiInject } from "inversify";
import { MetadataProviderInterface } from "@src/Interfaces/MetadataProviderInterface";
import SI from "@config/inversify.types";

@injectable()
export default class MetadataProviderRegistry {
    constructor(
        @multiInject(SI["service:metadata:provider"])
        private providers: MetadataProviderInterface[]
    ) {}

    getMetadata(path: string, type: string): any {
        const provider = this.providers.find(p => p.canHandle(path, type));
        return provider ? provider.getMetadata(path, type) : null;
    }

    async ensureMetadataCached(path: string, type: string): Promise<void> {
        const provider = this.providers.find(p => p.canHandle(path, type));
        if (provider && provider.ensureMetadataCached) {
            await provider.ensureMetadataCached(path, type);
        }
    }
}