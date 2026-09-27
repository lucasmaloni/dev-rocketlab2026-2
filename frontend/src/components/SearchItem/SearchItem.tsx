import PosterFrame from "../PosterFrame/PosterFrame";
import type { MovieCatalogItem } from "../../types/movieCatalogItem";
import styles from "./SearchItem.module.css";

interface SearchItemProps {
	movie: MovieCatalogItem;
	onSelect: () => void;
}

function SearchItem({ movie, onSelect }: SearchItemProps) {
	return (
		<button className={styles.item} type="button" onClick={onSelect} role="option">
			<PosterFrame
				src={movie.posterUrl ?? ""}
				alt={movie.titulo}
				size={42}
			/>
			<span>{movie.titulo}</span>
		</button>
	);
}

export default SearchItem;
