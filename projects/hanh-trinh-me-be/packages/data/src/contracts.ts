/** Public content model. No SQL, database drivers or HTTP clients in this contract. */
export interface Stage {slug:string;title:string;icon:string;range:string;description:string;order:number}
export interface ArticleSource {name:string;url:string}
export interface ArticleSection {heading:string;paragraphs:string[]}
export type EditorialStatus="draft"|"in_review"|"published"|"archived";
export interface ArticleMediaAsset {src:string;alt:string;caption:string;credit:string;license:"original";sourceUrl?:string}\nexport interface ArticleMedia {cover?:ArticleMediaAsset;inline?:Array<ArticleMediaAsset&{afterSection:number}>;highlights?:string[]}\nexport interface Article {slug:string;stage:string;title:string;summary:string;readMinutes:number;order:number;status:EditorialStatus;lastReviewed:string|null;tags:string[];sections:ArticleSection[];sources:ArticleSource[];media?:ArticleMedia}
export type ArticleSummary=Omit<Article,"sections"|"sources">;
export interface Topic {id:string;slug:string;title:string;stageSlugs:string[];order:number;editorialStatus:EditorialStatus}
export interface SourceReference {id:string;publisher:string;title:string;url:string;publicationYear:string;topic:string;stageSlugs:string[];accessedAt:string;referenceType:string;language:string;status:string;usage:string;clinicalApproval:boolean;notice:string}
export interface ResearchCard {id:string;stageSlug:string;topicId:string;title:string;summary:string;readerQuestion:string;practicePrompt:string;sourceIds:string[];status:EditorialStatus;createdAt:string;reviewedAt:string|null;reviewer:string|null;originalSummary:boolean;medicalApproval:boolean}
export interface Page<T>{data:T[];meta:{total:number;page:number;limit:number}}
export interface ArticleQuery{q?:string;stage?:string;status?:EditorialStatus;page?:number;limit?:number}
export interface ResearchQuery{stage?:string;topicId?:string}
export interface EditorialOverview{provider:"mock"|"postgres";stages:number;articles:number;drafts:number;published:number;topics:number;sources:number;researchCards:number;lastSeededAt:string}
export interface MockContentDataset {version:string;disclaimer:string;stages:Stage[];articles:Article[];topics:Topic[];sources:SourceReference[];researchCards:ResearchCard[];seededAt:string}
export interface KnowledgeRepository {
 readonly provider: "mock"|"postgres"|"api";
 listStages():Promise<Stage[]>;
 getStage(slug:string):Promise<Stage|null>;
 listArticles(query?:ArticleQuery):Promise<Page<ArticleSummary>>;
 getArticle(slug:string):Promise<Article|null>;
 listTopics(stageSlug?:string):Promise<Topic[]>;
 listSources(stageSlug?:string):Promise<SourceReference[]>;
 listResearchCards(query?:ResearchQuery):Promise<ResearchCard[]>;
 getOverview():Promise<EditorialOverview>;
 getDisclaimer():Promise<string>;
}
/** Future PostgreSQL adapter will implement KnowledgeRepository without changing API/Web consumers. */
