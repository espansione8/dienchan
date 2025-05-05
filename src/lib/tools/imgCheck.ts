export const imgCheck = (array: any[], type: string) => {
    //type -> 'product-primary', 'product-gallery', 'membership', 'course'
    const imgfilter = array
        .filter((item: any) => item.type == type)
        .map((item: any) => item.filename);
    if (imgfilter.length > 0) {
        return imgfilter; // is array
    } else {
        return [];
    }
};

// // EXAMPLE
// import { imgCheck } from '$lib/tools/imgCheck';

// A) RETURN ARRAY
// const imgPrimary = imgCheck(item.uploadfiles, 'product-primary');

// B) RETURN FIRST ITEM IN ARRAY
// <img
//     class="max-h-20"
//     src = {`files/product/${row.prodId}/${imgCheck(row.uploadfiles, 'product-primary')[0]}`}
//     alt = { row.title }
// />

//'/images/picture.png'