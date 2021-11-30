import { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import FoodCard from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

export interface Food {
	id: number;
	name: string;
	description: string;
	price: number;
	available: boolean;
	image: string;
}

export type NewFood = Omit<Food, 'available' | 'id'>;

function Dashboard() {
	const [foods, setFoods] = useState<Food[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingFood, setEditingFood] = useState({} as Food);

	useEffect(() => {
		async function getData() {
			const response = await api.get('/foods');
			setFoods(response.data);
		}
		getData();
	}, []);

	async function handleAddFood(food: NewFood) {
		try {
			const response = await api.post('/foods', {
				...food,
				available: true,
			});

			setFoods((oldFoods) => [...oldFoods, response.data]);
		} catch (err) {
			console.log(err);
		}
	}

	const handleUpdateFood = async (food: NewFood) => {
		try {
			const foodUpdated = await api.put(`/foods/${editingFood.id}`, {
				...editingFood,
				...food,
			});

			const foodsUpdated = foods.map((f) =>
				f.id !== foodUpdated.data.id ? f : foodUpdated.data
			);

			setFoods(foodsUpdated);
		} catch (err) {
			console.log(err);
		}
	};

	const handleDeleteFood = async (id: number) => {
		await api.delete(`/foods/${id}`);

		const foodsFiltered = foods.filter((food) => food.id !== id);

		setFoods(foodsFiltered);
	};

	const toggleModal = () => {
		setModalOpen(!modalOpen);
	};

	const toggleEditModal = () => {
		setEditModalOpen(!editModalOpen);
	};

	const handleEditFood = (food: Food) => {
		setEditingFood(food);
		setEditModalOpen(true);
	};

	return (
		<>
			<Header openModal={toggleModal} />
			<ModalAddFood
				isOpen={modalOpen}
				setIsOpen={toggleModal}
				handleAddFood={handleAddFood}
			/>
			<ModalEditFood
				isOpen={editModalOpen}
				setIsOpen={toggleEditModal}
				editingFood={editingFood}
				handleUpdateFood={handleUpdateFood}
			/>

			<FoodsContainer data-testid='foods-list'>
				{foods &&
					foods.map((food) => (
						<FoodCard
							key={food.id}
							food={food}
							handleDelete={handleDeleteFood}
							handleEditFood={handleEditFood}
						/>
					))}
			</FoodsContainer>
		</>
	);
}

export default Dashboard;
