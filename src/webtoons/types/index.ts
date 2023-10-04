export const UpdateDay = {
    "월": 1,
    "화": 2,
    "수": 3,
    "목": 4,
    "금": 5,
    "토": 6,
    "일": 7,
    "완": 12,
}

export const UpdateDayList = [ "월", "화", "수", "목", "금", "토", "일", "완"];

export type WebtoonInfo = {
    webtoonId: string;
    title: string;
    author: string[] | null;
    episodeLength: number | null;
    thumbnail: string | null;
    service: string;
    updateDay: string;
    category: string;
    genres: string[] | null;
    genreCount: number;
    description: string | null;
    fanCount: number | null;
    embVector: number[] | null;
}

export interface WebtoonEPLength {
    webtoonId: string;
    service: string;
    episodeLength: number | null;
}

export interface WebtoonUpdateDay {
    webtoonId: string;
    service: string;
    updateDay: string | null;
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
    category?: string,
    service?: string,
    descriptionLength?: number;
}