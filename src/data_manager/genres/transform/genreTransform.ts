import { TransformType } from "../constants/types";

const categoryPath: string = "/workspace/finding_restaurant/finding_rest/src/data_manager/genres/constants/kakaoCategoryKeyword.json";
const kakaoGenrePath: string = "/workspace/finding_restaurant/finding_rest/src/data_manager/genres/constants/kakaoGenreKeyword.json";
const naverGenrePath: string = "/workspace/finding_restaurant/finding_rest/src/data_manager/genres/constants/naverGenreKeyword.json";

const kakaoTransformPath: string = "/workspace/finding_restaurant/finding_rest/src/data_manager/genres/transform/kakaoGenreTransform.json";
const naverTransformPath: string = "/workspace/finding_restaurant/finding_rest/src/data_manager/genres/transform/naverGenreTransform.json";

const allCategory: string[] = require(categoryPath);
const kakaoGenre: string[] = require(kakaoGenrePath);
const naverGenre: string[] = require(naverGenrePath);

const kakaoTransform: TransformType = require(kakaoTransformPath);
const naverTransform: TransformType = require(naverTransformPath);

function concatTransformGenres(genre: string, transformedGenre: string, transformedGenres: string[]): void {
    if (transformedGenre.includes(",")) {
        const transformedGenreList: string[] = transformedGenre.split(",");
        transformedGenreList.forEach(
            (genre) => {
                if (genre && (!transformedGenres.includes(genre))) transformedGenres.push(genre);
            }
        );
    } else {
        if (transformedGenre && (!transformedGenres.includes(transformedGenre))) transformedGenres.push(transformedGenre);
    }
}

export function genreNaverTransform(genres: string[]): string[] {
    const transformedGenres: string[] = [ genres[0] ];
    
    genres.forEach(
        (genre) => {
            if (genre && Object.keys(naverTransform).includes(genre)) {
                const transformedGenre: string = naverTransform[genre];
                concatTransformGenres(genre, transformedGenre, transformedGenres);
            } else {
                if (genre && (!transformedGenres.includes(genre)) && kakaoGenre.includes(genre)) transformedGenres.push(genre);
            }
        }
    );

    return transformedGenres;
}

export function genreKakaoTransform(genres: string[]): string[] {
    const transformedGenres: string[] = [ genres[0] ];
    genres.forEach(
        (genre) => {
            if (genre && Object.keys(kakaoTransform).includes(genre)) {
                const transformedGenre: string = kakaoTransform[genre];
                concatTransformGenres(genre, transformedGenre, transformedGenres);
            } else {
                if (genre && (!transformedGenres.includes(genre)) && kakaoGenre.includes(genre)) transformedGenres.push(genre);
            }
        }
    );

    return transformedGenres;
}

export function genreRecommendTransform(genres: string[]): string[] {
    const category: string = genres[0];

    if (!allCategory.includes(category)) {
        return [];
    }

    const transformedGenres: string[] = [ category ];

    genres.slice(1).map(
        (genre) => {
            if (kakaoGenre.includes(genre)) {
                transformedGenres.push(genre);
                return;
            }

            for (let kGenre of kakaoGenre) {
                if (kGenre.includes(genre)) {
                    transformedGenres.push(kGenre);
                    break;
                }
            }
        }
    );

    return transformedGenres;
}