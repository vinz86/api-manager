import type { IPostService } from "~/services/interfaces/IPostService";
import type { PostDTO } from "~/services/models/dto/PostDTO";
import type { IApiResponse } from "~/layers/api-manager";

export class MockPostService implements IPostService {
    private baseUrl = '/mock';
    private latency = 200;

    constructor(private useApiResponse: boolean = false) {}

    private async simulateNetwork<T>(data: T): Promise<T> {
        return new Promise(resolve => {
            setTimeout(() => resolve(data), this.latency);
        });
    }

    private async fetchFromJson<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}/${endpoint}.json`);
        if (!response.ok) {
            throw new Error(`Errore nel caricamento dei dati: ${response.status}`);
        }
        return await response.json();
    }

    async getPosts(filters: PostDTO): Promise<PostDTO[]>;
    async getPosts(filters: PostDTO): Promise<IApiResponse<PostDTO[]>>;
    async getPosts(filters: PostDTO): Promise<PostDTO[] | IApiResponse<PostDTO[]>> {
        try {
            const data = await this.fetchFromJson<PostDTO[]>('posts');
            return this.simulateNetwork(data);
        } catch (error) {
            if (this.useApiResponse) {
                return this.simulateNetwork([]);
            }
            throw error;
        }
    }

    async getPost(id: number): Promise<PostDTO>;
    async getPost(id: number): Promise<IApiResponse<PostDTO>>;
    async getPost(id: number): Promise<PostDTO | IApiResponse<PostDTO>> {
        try {
            const posts = await this.fetchFromJson<PostDTO[]>('posts');
            const post = posts.find(p => p.id === id);

            if (!post) {
                throw new Error('Post non trovato');
            }

            return this.simulateNetwork(post);
        } catch (error) {
            if (this.useApiResponse) {
                return this.simulateNetwork({} as PostDTO);
            }
            throw error;
        }
    }

    async createPost(post: Omit<PostDTO, 'id'>): Promise<PostDTO> {
        try {
            const posts = await this.fetchFromJson<PostDTO[]>('posts');
            const newId = Math.max(...posts.map(p => p.id)) + 1;
            const newPost: PostDTO = { ...post, id: newId };

            posts.push(newPost);

            return this.simulateNetwork(
                this.useApiResponse
                    ? (newPost as PostDTO)
                    : newPost
            );
        } catch (error) {
            throw new Error('Errore nella creazione del post');
        }
    }

    async updatePost(id: number, post: Partial<PostDTO>): Promise<PostDTO> {
        try {
            const posts = await this.fetchFromJson<PostDTO[]>('posts');
            const index = posts.findIndex(p => p.id === id);

            if (index === -1) {
                throw new Error('Post non trovato');
            }

            const updatedPost = { ...posts[index], ...post };
            posts[index] = updatedPost;

            return this.simulateNetwork(
                this.useApiResponse
                    ? (updatedPost as PostDTO)
                    : updatedPost
            );
        } catch (error) {
            throw new Error('Errore nell\'aggiornamento del post');
        }
    }

    async deletePost(id: number): Promise<void> {
        try {
            const posts = await this.fetchFromJson<PostDTO[]>('posts');
            const index = posts.findIndex(p => p.id === id);

            if (index === -1) {
                throw new Error('Post non trovato');
            }

            posts.splice(index, 1);

            return this.simulateNetwork(undefined as any);
        } catch (error) {
            throw new Error('Errore nell\'eliminazione del post');
        }
    }

}