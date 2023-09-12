export const UpdateDay = {
    "월": 1,
    "화": 2,
    "수": 3,
    "목": 4,
    "금": 5,
    "토": 6,
    "일": 7,
}

export type WebtoonInfo = {
    webtoonId: string | null;
    title: string | null;
    author: string[] | string | null;
    episodeLength: number | null;
    thumbnail: string | null;
    service: string | null;
    updateDay: string | null;
    category: string | null;
    genres: string[] | string | null;
    genreCount: number | null;
    description: string | null;
    fanCount: number | null;
    embVector: number[] | null;
}

export type trainingData = {
    prompt: string,
    completion: string,
}

export type trainingResult = {
    title: string,
    genres: string[],
}

export type SelectOption = {
    genreCount: number,
    genre?: string,
    service?: string,
}