// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			userData: User | null;
			user: User | null;
			auth: boolean | null;
			status: string;
		}
		interface User {
			membership: {
				membershipExpiry: Date | string;
				membershipSignUp: Date | string;
				membershipActivation: Date | string;
			}
		}
		interface Locals {
			userData: User | null;
			user: User | null;
			auth: boolean | null;
			status: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
