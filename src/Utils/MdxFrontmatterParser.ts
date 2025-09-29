import { injectable } from "inversify";
import { TFile, Vault } from "obsidian";

interface FrontmatterData {
    [key: string]: any;
}

@injectable()
export default class MdxFrontmatterParser {
    private cache = new Map<string, { frontmatter: FrontmatterData | null; mtime: number }>();

    constructor(private vault: Vault) {}

    async parseFrontmatter(path: string): Promise<FrontmatterData | null> {
        const file = this.vault.getAbstractFileByPath(path) as TFile;
        if (!file || !path.endsWith('.mdx')) {
            return null;
        }

        // Check cache first
        const cached = this.cache.get(path);
        if (cached && cached.mtime === file.stat.mtime) {
            return cached.frontmatter;
        }

        try {
            const content = await this.vault.read(file);
            const frontmatter = this.extractFrontmatter(content);
            
            // Update cache
            this.cache.set(path, {
                frontmatter,
                mtime: file.stat.mtime
            });

            return frontmatter;
        } catch (error) {
            console.warn(`Failed to parse MDX frontmatter for ${path}:`, error);
            return null;
        }
    }

    private extractFrontmatter(content: string): FrontmatterData | null {
        // Match YAML frontmatter at the beginning of the file
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
        const match = content.match(frontmatterRegex);
        
        if (!match) {
            return null;
        }

        try {
            // Use a simple YAML parser for basic frontmatter
            return this.parseYaml(match[1]);
        } catch (error) {
            console.warn('Failed to parse YAML frontmatter:', error);
            return null;
        }
    }

    private parseYaml(yamlString: string): FrontmatterData {
        const result: FrontmatterData = {};
        const lines = yamlString.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue; // Skip empty lines and comments
            }

            const colonIndex = trimmed.indexOf(':');
            if (colonIndex === -1) {
                continue; // Skip lines without colons
            }

            const key = trimmed.substring(0, colonIndex).trim();
            let value = trimmed.substring(colonIndex + 1).trim();

            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // Try to parse as number or boolean
            if (value === 'true') {
                result[key] = true;
            } else if (value === 'false') {
                result[key] = false;
            } else if (!isNaN(Number(value)) && value !== '') {
                result[key] = Number(value);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    clearCache(): void {
        this.cache.clear();
    }

    removeCacheEntry(path: string): void {
        this.cache.delete(path);
    }

    getCachedFrontmatter(path: string): FrontmatterData | null {
        const cached = this.cache.get(path);
        return cached ? cached.frontmatter : null;
    }

    async ensureFrontmatterCached(path: string): Promise<void> {
        if (!this.cache.has(path) || this.isCacheStale(path)) {
            await this.parseFrontmatter(path);
        }
    }

    private isCacheStale(path: string): boolean {
        const file = this.vault.getAbstractFileByPath(path) as TFile;
        const cached = this.cache.get(path);
        return !file || !cached || cached.mtime !== file.stat.mtime;
    }
}