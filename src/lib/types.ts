export type Users = {
    name: string | null;
    surname: string | null;
    email: string | null;
};

export type Locals = {
    auth: boolean;
    data: Record<string, unknown>; // any type
};

export type MembershipProduct = {
    createdAt: string;
    title: string;
    descrShort: string;
    price: number;
    renewalLength: number;
    // Add other membership
};

export type UserModel = App.UserModel;
//USE import type { UserModel } from '$lib/types';