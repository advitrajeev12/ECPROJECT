const SERVER_URL = "http://172.20.10.2:5001";

export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    WISHLIST: "/user/wishlist",
    CART: "/user/cart",
    BULK_ORDERS: "/bulk-orders",
    PRODUCT_CATEGORIES: "/productcategories",
    COLLECTIONS: "/collections",
    PRODUCT: "/product",
    PROFILE: "/user/profile",
    CHECKOUT: "/user/checkout",
    PAYMENT_STATUS: "/user/payment/status",
    ABOUT: "/about",
    ARTISANS: "/artisans",
    IMPACT: "/impact",
    CONTACT: "/contact",
    SHIPPING: "/shipping",
    PRIVACY: "/privacy",
    TERMS: "/terms",
    SEARCH: "/search",
    ARCHIVE: "/archive",
};

export const NAV_LINKS = [
    {
        name: "Rugs",
        href: `${ROUTES.PRODUCT_CATEGORIES}/rugs`,
        children: [
            { name: "Doormat", href: `${ROUTES.PRODUCT_CATEGORIES}/rugs/doormat` },
            { name: "Aasan", href: `${ROUTES.PRODUCT_CATEGORIES}/rugs/aasan` },
            { name: "Yoga Mat", href: `${ROUTES.PRODUCT_CATEGORIES}/rugs/yoga-mat` },
            { name: "Runner", href: `${ROUTES.PRODUCT_CATEGORIES}/rugs/runner` },
            { name: "Floor Rugs", href: `${ROUTES.PRODUCT_CATEGORIES}/rugs/floor-rugs` }
        ]
    },
    {
        name: "Bamboo Crafts",
        href: `${ROUTES.PRODUCT_CATEGORIES}/bamboo`,
        children: [
            { name: "Lantern (Cylindrical, Globe, Petromax)", href: `${ROUTES.PRODUCT_CATEGORIES}/bamboo/lantern` },
            { name: "Jewellery & Cosmetic Box", href: `${ROUTES.PRODUCT_CATEGORIES}/bamboo/jewellery-cosmetic-box` },
            { name: "Laundry / Dustbin Bag", href: `${ROUTES.PRODUCT_CATEGORIES}/bamboo/laundry-bag` },
            { name: "Pen Stand", href: `${ROUTES.PRODUCT_CATEGORIES}/bamboo/pen-stand` },
            { name: "Utility Box", href: `${ROUTES.PRODUCT_CATEGORIES}/bamboo/utility-box` }
        ]
    },
    {
        name: "Sikki & Moonj",
        href: `${ROUTES.PRODUCT_CATEGORIES}/sikki-moonj`,
        children: [
            { name: "Tokri", href: `${ROUTES.PRODUCT_CATEGORIES}/sikki-moonj/tokri` },
            { name: "Laundry Bag", href: `${ROUTES.PRODUCT_CATEGORIES}/sikki-moonj/laundry-bag` },
            { name: "Wall Hanging", href: `${ROUTES.PRODUCT_CATEGORIES}/sikki-moonj/wall-hanging` },
            { name: "Utility Box", href: `${ROUTES.PRODUCT_CATEGORIES}/sikki-moonj/utility-box` }
        ]
    },
    {
        name: "Apparels",
        href: `${ROUTES.PRODUCT_CATEGORIES}/apparel`,
        children: [
            { name: "Silk Fabric", href: `${ROUTES.PRODUCT_CATEGORIES}/apparel/silk-fabric` },
            { name: "Cotton Fabric", href: `${ROUTES.PRODUCT_CATEGORIES}/apparel/cotton-fabric` },
            { name: "Shirts", href: `${ROUTES.PRODUCT_CATEGORIES}/apparel/shirts` },
            { name: "Pants", href: `${ROUTES.PRODUCT_CATEGORIES}/apparel/pants` }
        ]
    },
    { name: "Painting", href: `${ROUTES.PRODUCT_CATEGORIES}/painting` },
    { name: "Archive", href: ROUTES.ARCHIVE },
    { name: "Customize", href: ROUTES.BULK_ORDERS },
];
