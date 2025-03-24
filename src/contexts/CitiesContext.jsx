import { createContext, useEffect, useContext, useReducer, useCallback } from 'react';

const CitiesContext = createContext();

const initialState = {
	cities: [],
	isLoading: false,
	currentCity: {},
	error: '',
};

function reducer(state, action) {
	switch (action.type) {
		case 'loading':
			return { ...state, isLoading: true };

		case 'cities/loaded':
			return {
				...state,
				isLoading: false,
				cities: action.payload,
			};

		case 'city/loaded':
			return { ...state, isLoading: false, currentCity: action.payload };

		case 'city/created':
			return {
				...state,
				isLoading: false,
				cities: [...state.cities, action.payload],
				currentCity: action.payload,
			};

		case 'city/deleted':
			return {
				...state,
				isLoading: false,
				cities: state.cities.filter((city) => city.id !== action.payload),
				currentCity: {},
			};

		case 'rejected':
			return {
				...state,
				isLoading: false,
				error: action.payload,
			};

		default:
			throw new Error('Unknown action type');
	}
}

function CitiesProvider({ children }) {
	const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(reducer, initialState);

	useEffect(function () {
		dispatch({ type: 'loading' });
		try {
			const savedCities = localStorage.getItem('cities');
			if (savedCities) {
				dispatch({ type: 'cities/loaded', payload: JSON.parse(savedCities) });
			}
		} catch {
			dispatch({
				type: 'rejected',
				payload: 'There was an error loading cities...',
			});
		}
	}, []);

	useEffect(
		function () {
			if (cities.length > 0) {
				localStorage.setItem('cities', JSON.stringify(cities));
			}
		},
		[cities]
	);

	const getCity = useCallback(
		function getCity(id) {
			if (Number(id) === currentCity.id) return;

			dispatch({ type: 'loading' });
			try {
				const city = cities.find((city) => city.id === Number(id));
				if (city) {
					dispatch({ type: 'city/loaded', payload: city });
				} else {
					dispatch({
						type: 'rejected',
						payload: 'City not found...',
					});
				}
			} catch {
				dispatch({
					type: 'rejected',
					payload: 'There was an error loading the city...',
				});
			}
		},
		[currentCity.id, cities]
	);

	function createCity(newCity) {
		dispatch({ type: 'loading' });
		try {
			const cityWithId = {
				...newCity,
				id: Date.now(),
			};
			dispatch({ type: 'city/created', payload: cityWithId });
		} catch {
			dispatch({
				type: 'rejected',
				payload: 'There was an error creating the city...',
			});
		}
	}

	function deleteCity(id) {
		dispatch({ type: 'loading' });
		try {
			dispatch({ type: 'city/deleted', payload: id });
		} catch {
			dispatch({
				type: 'rejected',
				payload: 'There was an error deleting the city...',
			});
		}
	}

	return (
		<CitiesContext.Provider
			value={{
				cities,
				isLoading,
				currentCity,
				error,
				getCity,
				createCity,
				deleteCity,
			}}
		>
			{children}
		</CitiesContext.Provider>
	);
}

function useCities() {
	const context = useContext(CitiesContext);
	if (context === undefined) throw new Error('CitiesContext was used outside the CitiesProvider');
	return context;
}

export { CitiesProvider, useCities };
