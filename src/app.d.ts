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
				membershipLevel: string;
				membershipStatus: boolean;
			},
			userId: string;
			name: string;
			surname: string;
			address: string;
			city: string;
			county: string;
			postalCode: string;
			country: string;
			phone: string;
			mobilePhone: string;
			email: string;
			level: string;
			addressPublic: boolean;
			cityPublic: boolean;
			countyPublic: boolean;
			postalCodePublic: boolean;
			countryPublic: boolean;
			phonePublic: boolean;
			mobilePhonePublic: boolean;
			namePublic: boolean;
			surnamePublic: boolean;
			emailPublic: boolean;
			uploadfiles: any[];
			pointsBalance: number;
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
