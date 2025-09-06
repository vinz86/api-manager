import type {TestPostDTO} from "#layers/api-manager/public/examples/services/models/dto/TestPostDTO";
import type {IApiResponse} from "~/layers/api-manager";

export interface ITestPostService {
    getPosts(filters: any): Promise<TestPostDTO[]| IApiResponse<TestPostDTO[]>>;
    getPost(id: number): Promise<TestPostDTO>;
    createPost(post: Omit<TestPostDTO, 'id'>): Promise<TestPostDTO>;
    updatePost(id: number, post: Partial<TestPostDTO>): Promise<TestPostDTO>;
    deletePost(id: number): Promise<void>;
}