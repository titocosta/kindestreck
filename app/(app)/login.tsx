import Login from '@/components/Login';
import { Redirect } from 'expo-router';
import { useAppContext } from '@/utils/AppContext';

export default function LoginScreen() {
  // const { user } = useAppContext();
  // if(user) return <Redirect href="/" />;
  return <Login />;
}