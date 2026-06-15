export const getShopStyle = (shopName) => {
    if (!shopName) return { emoji: '🏬', bgColor: 'bg-gray-100', textColor: 'text-gray-600', borderColor: 'border-gray-200' };

    const name = shopName.toLowerCase();

    const shops = [
        { keywords: ['пятёрочка', 'пятерочка'], emoji: '🏪', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200' },
        { keywords: ['магнит'], emoji: '🔴', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200' },
        { keywords: ['лента'], emoji: '🔵', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
        { keywords: ['перекрёсток', 'перекресток'], emoji: '🟢', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
        { keywords: ['озон'], emoji: '📦', bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
        { keywords: ['wildberries', 'wb'], emoji: '🟣', bgColor: 'bg-fuchsia-100', textColor: 'text-fuchsia-700', borderColor: 'border-fuchsia-200' },
        { keywords: ['яндекс', 'лавка'], emoji: '🟡', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
        { keywords: ['вкусвилл'], emoji: '🟢', bgColor: 'bg-teal-100', textColor: 'text-teal-700', borderColor: 'border-teal-200' },
        { keywords: ['спар'], emoji: '🟠', bgColor: 'bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
        { keywords: ['чижик'], emoji: '🐥', bgColor: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
        { keywords: ['ярче'], emoji: '☀️', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
        { keywords: ['ашан'], emoji: '🛒', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
        { keywords: ['metro', 'метро'], emoji: '🏬', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
        { keywords: ['самокат'], emoji: '🛴', bgColor: 'bg-lime-100', textColor: 'text-lime-700', borderColor: 'border-lime-200' },
    ];

    for (const shop of shops) {
        if (shop.keywords.some(keyword => name.includes(keyword))) {
            return { emoji: shop.emoji, bgColor: shop.bgColor, textColor: shop.textColor, borderColor: shop.borderColor };
        }
    }

    return { emoji: '🏬', bgColor: 'bg-gray-100', textColor: 'text-gray-600', borderColor: 'border-gray-200' };
};