import { injectable, inject } from "inversify";
import { MetadataProviderInterface } from "@src/Interfaces/MetadataProviderInterface";
import MdxFrontmatterParser from "@src/Utils/MdxFrontmatterParser";
import SI from "@config/inversify.types";

@injectable()
export default class MdxMetadataProvider implements MetadataProviderInterface {
    constructor(
        @inject(SI["service:mdx:frontmatter:parser"])
        private mdxParser: MdxFrontmatterParser
    ) {}

    canHandle(path: string, type: string): boolean {
        return path.endsWith('.mdx') && type === 'frontmatter';
    }

    getMetadata(path: string, type: string): any {
        return this.mdxParser.getCachedFrontmatter(path);
    }

    async ensureMetadataCached(path: string, type: string): Promise<void> {
        await this.mdxParser.ensureFrontmatterCached(path);
    }
}