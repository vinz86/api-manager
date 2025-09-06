import { ApiHttpService } from "~/layers/api-manager";
import type { ITestPostService} from "#layers/api-manager/public/examples/services/interfaces/ITestPostService";
import type { TestPostCriteria} from "#layers/api-manager/public/examples/services/models/criteria/TestPostCriteria";
import type {TestPostDTO} from "#layers/api-manager/public/examples/services/models/dto/TestPostDTO";
import type {IApiResponse} from "~/layers/api-manager";

export class TestPostService extends ApiHttpService implements ITestPostService {

    getPosts(filters?: TestPostCriteria): Promise<TestPostDTO[]>;
    getPosts(filters?: TestPostCriteria): Promise<IApiResponse<TestPostDTO[]>>;
    async getPosts(filters?: TestPostDTO): Promise<TestPostDTO[] | IApiResponse<TestPostDTO[]>> {
        return await this.get<TestPostDTO[] | IApiResponse<TestPostDTO[]>>('posts', filters, {cached: true}) as TestPostDTO[] | IApiResponse<TestPostDTO[]>;
    }

    getPost(id: number): Promise<TestPostDTO>;
    getPost(id: number): Promise<IApiResponse<TestPostDTO>>;
    async getPost(id: number): Promise<TestPostDTO | IApiResponse<TestPostDTO>> {
        return await this.get<TestPostDTO | IApiResponse<TestPostDTO>>(`posts/${id}`, {}, {cached: true}) as TestPostDTO | IApiResponse<TestPostDTO>;
    }

    async createPost(post: Omit<TestPostDTO, 'id'>): Promise<TestPostDTO> {
        return await this.post<TestPostDTO>('posts', post);
    }

    async updatePost(id: number, post: Partial<TestPostDTO>): Promise<TestPostDTO> {
        return await this.patch<TestPostDTO>(`posts/${id}`, post);
    }

    async deletePost(id: number): Promise<void> {
        await this.delete<void>(`posts/${id}`);
    }
}