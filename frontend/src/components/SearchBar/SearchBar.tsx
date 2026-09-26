import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

function SearchBar({ placeholder, size } : { placeholder : string, size : number }) {

  return (
    <div className={styles.search}>
      <Search size={size} className={styles.searchIcon} />
      <input type="search" placeholder={placeholder} />
    </div>
  );
}

export default SearchBar;