export type User = {
    userId: string;
    userCode: string;
    status: 'enabled' | 'disabled';
    token: string;
    cookieId: string;
    promotions: any[];
    level: 'user' | 'formatore' | 'admin' | 'superadmin';
    membership: {
        senior: string;
        membershipLevel: 'Socio inattivo' | 'Socio ordinario' | 'Socio sostenitore' | 'Socio vitalizio' | 'Socio contributore' | 'Master Dien Chan';
        membershipSignUp: Date;
        membershipActivation: Date;
        membershipExpiry: Date;
        membershipStatus: boolean;
    } & MembershipPublic;
    codeSales: string;
    codeManager: string;
    codeSupervisor: string;
    codeAgency: string;
    codeSponsor: string;
    codeAdmin: string;
    codeSuperAdmin: string;
    name: string;
    namePublic: boolean;
    surname: string;
    surnamePublic: boolean;
    businessData: {
        businessName: string;
        vatNumber: string;
        businessCategory: string;
        businessAddress: string;
        businessCity: string;
        businessPostalCode: string;
        businessState: string;
        businessCountry: string;
        businessCounty: string;
        numberEmployed: number;
        grossIncome: string;
        role: string;
    };
    category: string;
    address: string;
    addressPublic: boolean;
    city: string;
    cityPublic: boolean;
    postalCode: string;
    postalCodePublic: boolean;
    county: string;
    countyPublic: boolean;
    region: string;
    regionPublic: boolean;
    country: string;
    countryPublic: boolean;
    language: string;
    mobilePhone: string;
    mobilePhonePublic: boolean;
    phone: string;
    phonePublic: boolean;
    email: string;
    emailPublic: boolean;
    documentUpload: string;
    photoUpload: string;
    gender: string;
    birthdate: string;
    socialSecurityNumber: string;
    card: {
        cardId: string;
        cardCode: string;
        cardActivation: Date;
        cardExpiry: Date;
        cardStatus: boolean;
    };
    username: string;
    password: string;
    pointsSpent: number;
    pointsBalance: number;
    pointsTotal: number;
    pointsBalanceDate: Date;
    userAvatar: string;
    privacyDate: Date;
    privacyAccept: string;
    revenue: number;
    target0: number;
    target1: number;
    target2: number;
    target3: number;
    target4: number;
    target5: number;
    target6: number;
    target7: number;
    target8: number;
    target9: number;
    target10: number;
    target11: number;
    target12: number;
    extra0: string;
    extra1: string;
    extra2: string;
    extra3: string;
    extra4: string;
    extra5: string;
    extra6: string;
    extra7: string;
    extra8: string;
    extra9: string;
    extra10: string;
    extra11: string;
    extra12: string;
    extraFieldNumber1: number;
    extraFieldNumber2: number;
    extraFieldNumber3: number;
    extraFieldNumber4: number;
    extraFieldNumber5: number;
    extraFieldNumber6: number;
    extraFieldNumber7: number;
    extraFieldNumber8: number;
    extraFieldNumber9: number;
    extraFieldNumber10: number;
    extraFieldNumber11: number;
    extraFieldNumber12: number;
    extraFieldNumber13: number;
    extraFieldNumber14: number;
    extraFieldNumber15: number;
    extraFieldNumber16: number;
    extraFieldNumber17: number;
    extraFieldNumber18: number;
    extraFieldNumber19: number;
    extraFieldNumber20: number;
    extraFieldNumber21: number;
    extraFieldNumber22: number;
    extraFieldNumber23: number;
    extraFieldNumber24: number;
    extraFieldText1: string;
    extraFieldText2: string;
    extraFieldText3: string;
    extraFieldText4: string;
    extraFieldText5: string;
    extraFieldText6: string;
    extraFieldText7: string;
    extraFieldText8: string;
    extraFieldText9: string;
    extraFieldText10: string;
    extraFieldText11: string;
    extraFieldText12: string;
    extraFieldText13: string;
    extraFieldText14: string;
    extraFieldText15: string;
    extraFieldText16: string;
    extraFieldText17: string;
    extraFieldText18: string;
    extraFieldText19: string;
    extraFieldText20: string;
    extraFieldText21: string;
    extraFieldText22: string;
    extraFieldText23: string;
    extraFieldText24: string;
    lastAccess: Date;
    counterAccess: number;
    remoteIP: string;
    remoteHost: string;
    remoteBrowser: string;
    notesOnUser: string;
    userCart: [];
    userWishList: [];
    documentPageArray: string[];
    storicoCorsiPartecipati: [];
    storicoCorsiCreati: [];
    docModifyArray: Array<{
        documentPageId: string;
        shortDescription: string;
        updateStatus: 'none' | 'sent' | 'approved';
        uploadedFiles: string[];
    }>;
    uploadfiles: Array<{
        type: 'id' | 'avatar' | 'none';
        filetype: string;
        filename: string;
        fileUrl: string;
    }>;
    trainingHistory: Array<{
        hours: number;
        description: string;
        date: Date;
        fileName: string;
        fileUrl: string;
    }>;

} & UserPublic;

export type MembershipPublic = {
    membershipLevel: string;
    membershipStatus: boolean;
    membershipExpiry: Date;
};

export type UserPublic = {
    namePublic: boolean;
    surnamePublic: boolean;
    emailPublic: boolean;
    addressPublic: boolean;
    cityPublic: boolean;
    countyPublic: boolean;
    postalCodePublic: boolean;
    countryPublic: boolean;
    phonePublic: boolean;
    mobilePhonePublic: boolean;
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

export type CartItem = {
    prodId?: string;
    title: string;
    type: string;
    layoutView: { layoutId?: string, price: number };
    orderQuantity: number;
    price: number;
    [key: string]: any;
};

export type DiscountItem = {
    discountId: string;
    code: string;
    type: 'amount' | 'percent';
    value: number;
    selectedApplicability: 'email' | 'membershipLevel' | 'prodId' | 'layoutId' | 'refPoints';
    status: 'active' | 'disabled';
    userId?: string;
    membershipLevel?: string;
    prodId?: string;
    layoutId?: string;
    [key: string]: any;
};

export interface Order {
    orderDate: string;
    orderId: string;
    promoterId: string;
    title: string;
    item: string;
    userView?: {
        email: string;
        name: string;
        surname: string;
        city: string;
        address: string;
        postalCode: string;
        countryState: string;
        country: string;
        phone: string;
        mobile: string;
        county: string;
    };
    cart: {
        prodId: string;
        title: string;
        type: string;
        orderQuantity: number;
        price: number;
        layoutView: {
            title: string;
            urlPic: string;
            price: number;
        };

        uploadfiles: Array<{
            type: 'product-primary' | 'product-gallery' | 'membership' | 'course' | 'none';
            filetype: string;
            filename: string;
            fileUrl: string;
        }>;
    }[];
    totalCart: number;
    totalValue: number;
    payment: {
        method: string;
        statusPayment: string;
    };
    status: string;
    type: 'course' | 'product' | 'membership';
    invoicing: {
        name: string;
        surname: string;
        businessName: string;
        vatNumber: string;
        address: string;
        city: string;
        postalCode: string;
        county: string;
        state: string;
        region: string;
        country: string;
        invoiceNotes: string;
        email: string;
        phone: string;
        mobile: string;
    },

    shipping: {
        name: string;
        surname: string;
        address: string;
        city: string;
        postalCode: string;
        county: string;
        state: string;
        region: string;
        country: string;
        deliveryNotes: string;
        email: string;
        phone: string;
        mobile: string;
        tracking: {
            company: string;
            trackingNumber: string;
            trackingLink: string;
            status: string;
            estimatedDelivery: Date
        }
    },
}

export interface Product {
    prodId: string;
    title: string;
    descrShort: string;
    stockQty: number;
    category: string;
    price: number;
    points: number;
    uploadfiles: Array<{
        type: 'product-primary';
        filetype: string;
        filename: string;
        fileUrl: string;
    }>;
    status: 'enabled' | 'disabled';
    hasFile?: boolean;
    createdAt: string;
}

export interface TableNames {
    userId: string;
    surname: string;
    name: string;
    layoutView: {
        title: string;
    };
}

export interface Notification {
    id: number;
    content: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}
