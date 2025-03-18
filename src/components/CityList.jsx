import styles from "./CityList.module.css";
import Spinner from "./Spinner";
import Message from "./Message";
import CityItem from "./CityItem";
import { useCities } from "../contexts/CitiesContext";
function CityList() {
  const { cities, isLoading, currentCity } = useCities();
  if (isLoading) return <Spinner />;
  if (!cities.length)
    return <Message message="Add your first city by clicking on the map" />;

  return (
    <ul className={styles.countryList}>
      {cities.map((city) => (
        <CityItem key={city.id} city={city} currentCity={currentCity} />
      ))}
    </ul>
  );
}

export default CityList;
