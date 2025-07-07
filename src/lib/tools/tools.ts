export const imgCheck = {
    // For single image checks ('product-primary', 'membership', 'course')
    single: (array: any[], type: string): string => {
        const foundItem = array.find((item: any) => item.type === type);
        if (foundItem) {
            return foundItem.fileUrl; // return file URL
        } else {
            return '/images/placeholder.jpg';
        }
    },

    // For multiple images ('product-gallery')
    array: (array: any[], type: string): string[] => {
        const imgUrls = array
            .filter((item: any) => item.type === type)
            .map((item: any) => item.fileUrl);
        return imgUrls; // Return the array URLs or []
    },

    // Extract filename ('product-primary', 'membership', 'course')
    fileName: (array: any[], type: string): string => {
        const foundItem = array.find((item: any) => item.type === type);
        if (foundItem) {
            return foundItem.fileName; // Returns the fileName string
        } else {
            return 'null';
        }
    },
};

// // EXAMPLE
// import { imgCheck } from '$lib/tools/tools.js';

// RETURN SINGLE URL
// imgCheck.single(user.uploadfiles, 'profile')

// RETURN ARRAY URLs
// imgCheck.array(product.uploadfiles, 'product-gallery')

// RETURN FILENAME
// imgCheck.fileName(row.uploadfiles, 'product-primary'

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
};
