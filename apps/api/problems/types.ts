export interface RemediationStep {
    actor: 'client' | 'developer' | 'admin' | 'devops' | string;
    title: string;
    description: string;
}

export interface ProblemPageProps {
    title: string;
    code: string;
    status: number;
    slug: string;
    summary: string;
    description: string;
    categoryLabel?: string;
    causes?: string[];
    remediation?: RemediationStep[];
    architectureNotes?: string[];
    relatedEndpoints?: string[];
    examplePayload?: Record<string, unknown>;
    canonicalUrl?: string;
}

export interface ProblemSummaryItem {
    code: string;
    slug: string;
    title: string;
    status: number;
    summary: string;
    categoryLabel: string;
}

export interface CatalogPageProps {
    problems: ProblemSummaryItem[];
    baseUrl?: string;
}
