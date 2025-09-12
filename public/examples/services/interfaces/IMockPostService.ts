import type { PostDTO } from "~/services/models/dto/PostDTO";
import type { PostCriteria } from "~/services/models/criteria/PostCriteria";

export interface IMockPostService {
    getPosts(): Promise<PostDTO[]>;
    getPost(id: number): Promise<PostDTO>;
    createPost(post: Omit<PostDTO, 'id'>): Promise<PostDTO>;
    updatePost(id: number, post: Partial<PostDTO>): Promise<PostDTO>;
    deletePost(id: number): Promise<void>;
    findPosts(criteria: PostCriteria): Promise<PostDTO[]>;
    clear(): Promise<void>;
    findEntity: (query?: any) => Promise<unknown[]>;
    getEntity: (id: string) => Promise<unknown>;
    createEntity: (data: Partial<unknown>) => Promise<unknown>;
    updateEntity: (id: string, data: Partial<unknown>) => Promise<PostDTO>;
    removeEntity: (id: string) => Promise<PostDTO>;
}