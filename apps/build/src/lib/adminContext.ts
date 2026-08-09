import { useOutletContext } from 'react-router-dom';
import type { User } from 'firebase/auth';

/** Context published by AdminLayout to every admin page rendered in its Outlet. */
export type AdminContext = { user: User };

/** Read the authenticated admin user inside any page rendered under AdminLayout. */
export function useAdminUser(): User {
  return useOutletContext<AdminContext>().user;
}
