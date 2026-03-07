export const CATEGORY_COLORS_DARK = {
    Technology: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Travel: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Lifestyle: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Food: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Music: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Fashion: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Health: "bg-primary-weak/10 text-teal-400 border-primary-weak/20",
    Sports: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Education: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Finance: "bg-green-500/10 text-green-400 border-green-500/20",
};

export const CATEGORY_COLORS_LIGHT = {
    Technology: "bg-blue-100 text-blue-700 border-blue-200",
    Travel: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Lifestyle: "bg-purple-100 text-purple-700 border-purple-200",
    Food: "bg-orange-100 text-orange-700 border-orange-200",
    Music: "bg-pink-100 text-pink-700 border-pink-200",
    Fashion: "bg-rose-100 text-rose-700 border-rose-200",
    Health: "bg-teal-100 text-teal-700 border-teal-200",
    Sports: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Education: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Finance: "bg-green-100 text-green-700 border-green-200",
};

export const CATEGORIES = [
    {id: 1, name: "Technology"}, {id: 2, name: "Lifestyle"},
    {id: 3, name: "Travel"}, {id: 4, name: "Music"},
    {id: 5, name: "Food"}, {id: 6, name: "Fashion"},
    {id: 7, name: "Health"}, {id: 8, name: "Sports"},
    {id: 9, name: "Education"}, {id: 10, name: "Finance"},
];

export const TAGS_BY_CATEGORY = {
    1: [{id: 1, name: "Java"}, {id: 2, name: "Python"}, {id: 3, name: "JavaScript"}, {id: 4, name: "React"}, {
        id: 5,
        name: "Node.js"
    }, {id: 6, name: "Docker"}],
    2: [{id: 7, name: "Wellness"}, {id: 8, name: "Minimalism"}, {id: 9, name: "Productivity"}],
    3: [{id: 10, name: "Adventure"}, {id: 11, name: "Backpacking"}, {id: 12, name: "Budget Travel"}],
    4: [{id: 13, name: "Indie"}, {id: 14, name: "Jazz"}, {id: 15, name: "Classical"}],
    5: [{id: 16, name: "Recipes"}, {id: 17, name: "Vegan"}, {id: 18, name: "Street Food"}],
    6: [{id: 19, name: "Trends"}, {id: 20, name: "Sustainable"}, {id: 21, name: "Vintage"}],
    7: [{id: 22, name: "Fitness"}, {id: 23, name: "Mental Health"}, {id: 24, name: "Nutrition"}],
    8: [{id: 25, name: "Football"}, {id: 26, name: "Basketball"}, {id: 27, name: "Running"}],
    9: [{id: 28, name: "Online Learning"}, {id: 29, name: "Tutorials"}, {id: 30, name: "Research"}],
    10: [{id: 31, name: "Investing"}, {id: 32, name: "Crypto"}, {id: 33, name: "Budgeting"}],
};

export const FONT_FAMILIES = [
    {label: "Default", value: "Georgia, serif"},
    {label: "Sans-serif", value: "Arial, sans-serif"},
    {label: "Monospace", value: "'Courier New', monospace"},
    {label: "Serif", value: "'Times New Roman', serif"},
    {label: "Modern", value: "'Trebuchet MS', sans-serif"},
];

export const FONT_SIZES = [
    {label: "Small", value: "13px"},
    {label: "Normal", value: "17px"},
    {label: "Medium", value: "20px"},
    {label: "Large", value: "24px"},
    {label: "X-Large", value: "30px"},
    {label: "Huge", value: "38px"},
];

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
}
