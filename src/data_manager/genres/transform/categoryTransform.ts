
export interface TransformedData {
    transformedCategory: string;
    transformedGenres: string[];
}

const naverCategoryTransformPath: string = "/workspace/finding_restaurant/finding_rest/src/data_manager/genres/transform/naverCategoryTransform.json";

const naverCategoryTransform: string[] = require(naverCategoryTransformPath);

export function categoryNaverTransform(category: string, genres: string[]): TransformedData {
    let transformedCategory: string = category;
    let transformedGenres: string[] = [...genres];

    if (Object.keys(naverCategoryTransform).includes(category)) {
        transformedCategory = naverCategoryTransform[category];
        transformedGenres[0] = transformedCategory;

        if (!transformedGenres.includes(category)) {
            transformedGenres.push(category);
        }
    }

    if (genres.includes("로판")) {
        transformedCategory = "로판";
        transformedGenres = transformedGenres.filter(
            (genre) => { return genre !== "로판" }
        );
        transformedGenres[0] = "로판";
    } 

    return {transformedCategory, transformedGenres};
}