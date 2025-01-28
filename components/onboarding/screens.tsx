// import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';



export type Data = {
  id: number;
  image?: any;
  icon?: any;
  title: string;
  text: string;
};

export const data: Data[] = [
  {
    id: 1,
    icon: <Feather name="upload" size={180} color="black" />,
    title: 'All your orders in one place',
    text: 'Place your orders to all of your retailers and suppliers from our app',
  },
  {
    id: 2,
    icon: <Feather name="dollar-sign" size={180} color="black" />,
    title: 'Get payment terms',
    text: 'Grow your business with 30-, 60-, 90-day terms',
  },
  {
    id: 3,
    icon: <Feather name="truck" size={180} color="black" />,
    title: 'Track your orders',
    text: 'Save time and money, plan your work accordingly',
  },
];
