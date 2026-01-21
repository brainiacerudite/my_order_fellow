export const generateOtp = (len = 6): string => {
    const min = Math.pow(10, len - 1);
    const max = Math.pow(10, len) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
};
