const REDIRECT_KEY = "redirectSlug";

export const setRedirectSlug = (slug) => {
    sessionStorage.setItem(REDIRECT_KEY, slug);
};

export const getRedirectSlug = () => {
    return sessionStorage.getItem(REDIRECT_KEY);
};

export const clearRedirectSlug = () => {
    sessionStorage.removeItem(REDIRECT_KEY);
};
