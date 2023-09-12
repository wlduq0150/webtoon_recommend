export function genreToString(genres: string[]): string {
    genres = genres.map((genre) => {return "#" + genre});
    const genreText: string = genres.join(" ");
    return genreText;
}