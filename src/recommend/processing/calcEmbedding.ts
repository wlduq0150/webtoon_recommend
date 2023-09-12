function calcSimilarityFromEmbedding(
    embVector1: number[],
    embVector2: number[]
): number {
    const n: number = (
        (embVector1.length !== embVector2.length) ? (
            embVector1.length < embVector2.length ? embVector1.length : embVector2.length
        ) : ( embVector1.length )
    );
    
    let similarity: number = 0;

    for (let i = 0; i < n; i++) {
        similarity += (embVector1[i] - embVector2[i]) ** 2;
    }
    similarity = Math.sqrt(similarity);

    return similarity;
}

export default calcSimilarityFromEmbedding;
