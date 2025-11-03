// src/routes.ts
export const routes = {
  LOGIN: "/(tabs)/login",
  REGISTER: "/(tabs)/register",
  TODOS: "/(tabs)/todos",
  // any other known routes you use:
  ROOT_TODOS: "/todos",
} as const;

export type Route = (typeof routes)[keyof typeof routes];

/**
 * Small helper you can use to navigate with type-safety.
 * Optionally type the router param if you import the Router type from 'next/navigation'.
 */
export function navigate(
  router: { replace: (to: string) => Promise<void> | void },
  route: Route
) {
  return router.replace(route);
}
