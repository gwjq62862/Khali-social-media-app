export const getPublicIdFromUrl = (url, folderName) => {
    if (!url) return null;
    const parts = url.split('/');
    const fileWithExtension = parts.pop();
    if (!fileWithExtension) return null;


    const publicIdWithoutFolder = fileWithExtension.split('.')[0];


    return `${folderName}/${publicIdWithoutFolder}`;
};