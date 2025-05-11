
const generateSlug = (text) => {
    if (!text) return '';

    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const ensureUniqueSlug = async (baseSlug, checkExistsFunc) => {
    let slug = baseSlug;
    let counter = 1;
    let exists = await checkExistsFunc(slug);

    while (exists) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        exists = await checkExistsFunc(slug);
    }

    return slug;
};

module.exports = {
    generateSlug,
    ensureUniqueSlug
};