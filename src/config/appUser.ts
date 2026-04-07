import { Role, User } from '../types';

const requiredEnv = (key: string) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const appUser: User = {
  id: requiredEnv('VITE_WAITER_ID'),
  name: requiredEnv('VITE_WAITER_NAME'),
  email: import.meta.env.VITE_WAITER_EMAIL ?? '',
  role: Role.WAITER,
  restaurantId: requiredEnv('VITE_RESTAURANT_ID'),
  status: 'active',
};
