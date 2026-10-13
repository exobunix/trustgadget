export interface SeedCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
}

export interface SeedBrand {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  logoUrl: string;
  isPopular: boolean;
  displayOrder: number;
}

export interface SeedModel {
  id: string;
  brandId: string;
  categoryId: string;
  name: string;
  slug: string;
  series: string;
  imageUrl: string;
  releaseYear: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  isPopular: boolean;
  isFeatured: boolean;
  specifications: Record<string, any>;
  variants: {
    id: string;
    name: string;
    slug: string;
    ram?: string;
    storage?: string;
    processor?: string;
    gpu?: string;
    screenSize?: string;
    color?: string;
    basePrice: number;
    minPrice: number;
    maxPrice: number;
    isDefault?: boolean;
  }[];
}

export interface SeedQuestion {
  id: string;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
  title: string;
  subtitle: string;
  code: string;
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'YES_NO' | 'DROPDOWN';
  displayOrder: number;
  answers: {
    id: string;
    code: string;
    label: string;
    description?: string;
    icon?: string;
    adjustmentType: 'FIXED' | 'PERCENTAGE';
    adjustmentValue: number;
    isRejection?: boolean;
    warningMessage?: string;
    displayOrder: number;
  }[];
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    id: 'cat_smartphone',
    name: 'Smartphones',
    slug: 'smartphones',
    icon: 'Smartphone',
    description: 'Sell old iPhones, Samsung Galaxy, OnePlus, Xiaomi, and all top Android smartphones for top cash.',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    displayOrder: 1,
  },
  {
    id: 'cat_laptop',
    name: 'Laptops',
    slug: 'laptops',
    icon: 'Laptop',
    description: 'Sell Apple MacBooks, Dell XPS, HP Pavilion, Lenovo ThinkPad, Gaming rigs, and ultrabooks instantly.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    displayOrder: 2,
  },
  {
    id: 'cat_tablet',
    name: 'Tablets',
    slug: 'tablets',
    icon: 'Tablet',
    description: 'Sell Apple iPads, Samsung Galaxy Tabs, Lenovo and Microsoft Surface tablets.',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    displayOrder: 3,
  },
  {
    id: 'cat_smartwatch',
    name: 'Smartwatches',
    slug: 'smartwatches',
    icon: 'Watch',
    description: 'Sell Apple Watch, Samsung Galaxy Watch, Garmin, Fossil, and premium smart wearables.',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    displayOrder: 4,
  },
  {
    id: 'cat_console',
    name: 'Gaming Consoles',
    slug: 'gaming-consoles',
    icon: 'Gamepad2',
    description: 'Sell PlayStation 5, PS4, Xbox Series X/S, and Nintendo Switch consoles.',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&auto=format&fit=crop&q=80',
    displayOrder: 5,
  },
  {
    id: 'cat_earbuds',
    name: 'Earbuds & Headphones',
    slug: 'earbuds-headphones',
    icon: 'Headphones',
    description: 'Sell Apple AirPods Pro, Sony WH-1000XM5, Bose, and Sennheiser audio gear.',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    displayOrder: 6,
  },
  {
    id: 'cat_camera',
    name: 'Cameras',
    slug: 'cameras',
    icon: 'Camera',
    description: 'Sell Sony Alpha, Canon EOS, Nikon mirrorless cameras and prime lenses.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    displayOrder: 7,
  },
  {
    id: 'cat_tv',
    name: 'Smart TVs',
    slug: 'smart-tvs',
    icon: 'Tv',
    description: 'Sell Sony Bravia, Samsung QLED, and LG OLED 4K Smart televisions.',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    displayOrder: 8,
  },
];

export const SEED_BRANDS: SeedBrand[] = [
  {
    "id": "b_lap_acer",
    "categoryId": "cat_laptop",
    "name": "Acer",
    "slug": "acer",
    "logoUrl": "/brands/acer.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_lap_apple",
    "categoryId": "cat_laptop",
    "name": "Apple",
    "slug": "apple-macbook",
    "logoUrl": "/brands/apple.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_lap_asus",
    "categoryId": "cat_laptop",
    "name": "ASUS",
    "slug": "asus",
    "logoUrl": "/brands/asus.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_lap_dell",
    "categoryId": "cat_laptop",
    "name": "Dell",
    "slug": "dell",
    "logoUrl": "/brands/dell.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_lap_hp",
    "categoryId": "cat_laptop",
    "name": "HP",
    "slug": "hp",
    "logoUrl": "/brands/hp.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_lap_lenovo",
    "categoryId": "cat_laptop",
    "name": "Lenovo",
    "slug": "lenovo",
    "logoUrl": "/brands/lenovo.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_lap_samsung",
    "categoryId": "cat_laptop",
    "name": "Samsung",
    "slug": "samsung-galaxy-book",
    "logoUrl": "/brands/samsung.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_lap_xiaomi",
    "categoryId": "cat_laptop",
    "name": "Xiaomi",
    "slug": "xiaomi-mi-notebook",
    "logoUrl": "/brands/xiaomi.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_lap_hcl",
    "categoryId": "cat_laptop",
    "name": "HCL",
    "slug": "hcl",
    "logoUrl": "/brands/hcl.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_honor",
    "categoryId": "cat_laptop",
    "name": "Honor",
    "slug": "honor",
    "logoUrl": "/brands/honor.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_iball",
    "categoryId": "cat_laptop",
    "name": "iBall",
    "slug": "iball",
    "logoUrl": "/brands/iball.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_lava",
    "categoryId": "cat_laptop",
    "name": "Lava",
    "slug": "lava",
    "logoUrl": "/brands/lava.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_lg",
    "categoryId": "cat_laptop",
    "name": "LG",
    "slug": "lg-gram",
    "logoUrl": "/brands/lg.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_micromax",
    "categoryId": "cat_laptop",
    "name": "Micromax",
    "slug": "micromax",
    "logoUrl": "/brands/micromax.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_microsoft",
    "categoryId": "cat_laptop",
    "name": "Microsoft Surface",
    "slug": "microsoft-surface",
    "logoUrl": "/brands/microsoft-surface.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_msi",
    "categoryId": "cat_laptop",
    "name": "MSI",
    "slug": "msi",
    "logoUrl": "/brands/msi.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_nokia",
    "categoryId": "cat_laptop",
    "name": "Nokia",
    "slug": "nokia",
    "logoUrl": "/brands/nokia.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_sony",
    "categoryId": "cat_laptop",
    "name": "Sony",
    "slug": "sony",
    "logoUrl": "/brands/sony.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_toshiba",
    "categoryId": "cat_laptop",
    "name": "Toshiba",
    "slug": "toshiba",
    "logoUrl": "/brands/toshiba.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_lap_razer",
    "categoryId": "cat_laptop",
    "name": "Razer Blade",
    "slug": "razer-blade",
    "logoUrl": "/brands/razer.svg",
    "isPopular": false,
    "displayOrder": 11
  },
  {
    "id": "b_lap_gigabyte",
    "categoryId": "cat_laptop",
    "name": "Gigabyte AORUS",
    "slug": "gigabyte-aorus",
    "logoUrl": "/brands/gigabyte.svg",
    "isPopular": false,
    "displayOrder": 12
  },
  {
    "id": "b_lap_infinix",
    "categoryId": "cat_laptop",
    "name": "Infinix ZERO Book",
    "slug": "infinix-zero-book",
    "logoUrl": "/brands/infinix.svg",
    "isPopular": false,
    "displayOrder": 14
  },
  {
    "id": "b_phone_apple",
    "categoryId": "cat_smartphone",
    "name": "Apple",
    "slug": "apple",
    "logoUrl": "/brands/apple.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_asus",
    "categoryId": "cat_smartphone",
    "name": "ASUS",
    "slug": "asus-rog-phone",
    "logoUrl": "/brands/asus.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_iqoo",
    "categoryId": "cat_smartphone",
    "name": "iQOO",
    "slug": "iqoo",
    "logoUrl": "/brands/iqoo.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_sma_lenovo",
    "categoryId": "cat_smartphone",
    "name": "Lenovo",
    "slug": "lenovo",
    "logoUrl": "/brands/lenovo.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_motorola",
    "categoryId": "cat_smartphone",
    "name": "Motorola",
    "slug": "motorola",
    "logoUrl": "/brands/motorola.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_nothing",
    "categoryId": "cat_smartphone",
    "name": "Nothing",
    "slug": "nothing",
    "logoUrl": "/brands/nothing.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_oneplus",
    "categoryId": "cat_smartphone",
    "name": "OnePlus",
    "slug": "oneplus",
    "logoUrl": "/brands/oneplus.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_oppo",
    "categoryId": "cat_smartphone",
    "name": "OPPO",
    "slug": "oppo",
    "logoUrl": "/brands/oppo.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_poco",
    "categoryId": "cat_smartphone",
    "name": "POCO",
    "slug": "poco",
    "logoUrl": "/brands/poco.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_realme",
    "categoryId": "cat_smartphone",
    "name": "Realme",
    "slug": "realme",
    "logoUrl": "/brands/realme.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_samsung",
    "categoryId": "cat_smartphone",
    "name": "Samsung",
    "slug": "samsung",
    "logoUrl": "/brands/samsung.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_vivo",
    "categoryId": "cat_smartphone",
    "name": "Vivo",
    "slug": "vivo",
    "logoUrl": "/brands/vivo.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_xiaomi",
    "categoryId": "cat_smartphone",
    "name": "Xiaomi",
    "slug": "xiaomi",
    "logoUrl": "/brands/xiaomi.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_phone_redmi",
    "categoryId": "cat_smartphone",
    "name": "Redmi",
    "slug": "redmi",
    "logoUrl": "/brands/redmi.svg",
    "isPopular": true,
    "displayOrder": 5
  },
  {
    "id": "b_sma_gionee",
    "categoryId": "cat_smartphone",
    "name": "Gionee",
    "slug": "gionee",
    "logoUrl": "/brands/gionee.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_google",
    "categoryId": "cat_smartphone",
    "name": "Google Pixel",
    "slug": "google-pixel",
    "logoUrl": "/brands/google-pixel.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_honor",
    "categoryId": "cat_smartphone",
    "name": "Honor",
    "slug": "honor",
    "logoUrl": "/brands/honor.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_huawei",
    "categoryId": "cat_smartphone",
    "name": "Huawei",
    "slug": "huawei",
    "logoUrl": "/brands/huawei.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_infinix",
    "categoryId": "cat_smartphone",
    "name": "Infinix",
    "slug": "infinix",
    "logoUrl": "/brands/infinix.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_sma_intex",
    "categoryId": "cat_smartphone",
    "name": "Intex",
    "slug": "intex",
    "logoUrl": "/brands/intex.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_sma_lg",
    "categoryId": "cat_smartphone",
    "name": "LG",
    "slug": "lg",
    "logoUrl": "/brands/lg.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_micromax",
    "categoryId": "cat_smartphone",
    "name": "Micromax",
    "slug": "micromax",
    "logoUrl": "/brands/micromax.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_nokia",
    "categoryId": "cat_smartphone",
    "name": "Nokia",
    "slug": "nokia",
    "logoUrl": "/brands/nokia.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_sma_panasonic",
    "categoryId": "cat_smartphone",
    "name": "Panasonic",
    "slug": "panasonic",
    "logoUrl": "/brands/panasonic.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_sony",
    "categoryId": "cat_smartphone",
    "name": "Sony",
    "slug": "sony-xperia",
    "logoUrl": "/brands/sony.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_tecno",
    "categoryId": "cat_smartphone",
    "name": "Tecno",
    "slug": "tecno",
    "logoUrl": "/brands/tecno.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_phone_cmf",
    "categoryId": "cat_smartphone",
    "name": "CMF by Nothing",
    "slug": "cmf",
    "logoUrl": "/brands/cmf.svg",
    "isPopular": true,
    "displayOrder": 13
  },
  {
    "id": "b_phone_hmd",
    "categoryId": "cat_smartphone",
    "name": "HMD",
    "slug": "hmd",
    "logoUrl": "/brands/hmd.svg",
    "isPopular": false,
    "displayOrder": 15
  },
  {
    "id": "b_phone_lava",
    "categoryId": "cat_smartphone",
    "name": "Lava",
    "slug": "lava",
    "logoUrl": "/brands/lava.svg",
    "isPopular": false,
    "displayOrder": 20
  },
  {
    "id": "b_phone_nubia",
    "categoryId": "cat_smartphone",
    "name": "Nubia RedMagic",
    "slug": "nubia",
    "logoUrl": "/brands/nubia.svg",
    "isPopular": false,
    "displayOrder": 22
  },
  {
    "id": "b_phone_zte",
    "categoryId": "cat_smartphone",
    "name": "ZTE",
    "slug": "zte",
    "logoUrl": "/brands/zte.svg",
    "isPopular": false,
    "displayOrder": 23
  },
  {
    "id": "b_phone_itel",
    "categoryId": "cat_smartphone",
    "name": "itel",
    "slug": "itel",
    "logoUrl": "/brands/itel.svg",
    "isPopular": false,
    "displayOrder": 24
  },
  {
    "id": "b_tab_acer",
    "categoryId": "cat_tablet",
    "name": "Acer",
    "slug": "acer",
    "logoUrl": "/brands/acer.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_amazon",
    "categoryId": "cat_tablet",
    "name": "Amazon",
    "slug": "amazon-kindle",
    "logoUrl": "/brands/amazon.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_apple",
    "categoryId": "cat_tablet",
    "name": "Apple",
    "slug": "apple-ipad",
    "logoUrl": "/brands/apple.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_asus",
    "categoryId": "cat_tablet",
    "name": "ASUS",
    "slug": "asus",
    "logoUrl": "/brands/asus.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_dell",
    "categoryId": "cat_tablet",
    "name": "Dell",
    "slug": "dell",
    "logoUrl": "/brands/dell.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_lenovo",
    "categoryId": "cat_tablet",
    "name": "Lenovo",
    "slug": "lenovo",
    "logoUrl": "/brands/lenovo.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_oneplus",
    "categoryId": "cat_tablet",
    "name": "OnePlus",
    "slug": "oneplus-pad",
    "logoUrl": "/brands/oneplus.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_samsung",
    "categoryId": "cat_tablet",
    "name": "Samsung",
    "slug": "samsung-galaxy-tab",
    "logoUrl": "/brands/samsung.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_xiaomi",
    "categoryId": "cat_tablet",
    "name": "Xiaomi",
    "slug": "xiaomi-pad",
    "logoUrl": "/brands/xiaomi.svg",
    "isPopular": true,
    "displayOrder": 1
  },
  {
    "id": "b_tab_honor",
    "categoryId": "cat_tablet",
    "name": "Honor",
    "slug": "honor",
    "logoUrl": "/brands/honor.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_tab_huawei",
    "categoryId": "cat_tablet",
    "name": "Huawei",
    "slug": "huawei",
    "logoUrl": "/brands/huawei.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_tab_iball",
    "categoryId": "cat_tablet",
    "name": "iBall",
    "slug": "iball",
    "logoUrl": "/brands/iball.svg",
    "isPopular": false,
    "displayOrder": 10
  },
  {
    "id": "b_tab_microsoft_surface",
    "categoryId": "cat_tablet",
    "name": "Microsoft Surface",
    "slug": "microsoft-surface",
    "logoUrl": "/brands/microsoft-surface.svg",
    "isPopular": false,
    "displayOrder": 10
  }
];

export const SEED_MODELS: SeedModel[] = require('./seed-models.json') as SeedModel[];

export const SEED_QUESTIONS: SeedQuestion[] = [
  // ================= SMARTPHONE QUESTIONS =================
  {
    id: 'q_phone_power',
    categoryId: 'cat_smartphone',
    title: 'Does your smartphone switch on?',
    subtitle: 'Ensure device boots up to the lock screen or home screen.',
    code: 'PHONE_POWER',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 1,
    answers: [
      { id: 'a_pp_yes', code: 'YES', label: 'Yes, boots up perfectly', description: 'Device powers on normally without boot loops', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_pp_no', code: 'NO', label: 'No, does not turn on (Dead)', description: 'Device is completely non-responsive or has dead motherboard', adjustmentType: 'PERCENTAGE', adjustmentValue: -70, isRejection: false, warningMessage: 'Dead devices are valued only for scrap/spares.', displayOrder: 2 },
    ],
  },
  {
    id: 'q_phone_display_touch',
    categoryId: 'cat_smartphone',
    title: 'Touchscreen & Display Functionality',
    subtitle: 'Check for touch responsiveness, ghost touch, lines, or spots.',
    code: 'PHONE_DISPLAY_TOUCH',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 2,
    answers: [
      { id: 'a_pdt_perfect', code: 'PERFECT', label: 'Flawless Touch & Display', description: 'No yellow tint, lines, flickering, or touch lag', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_pdt_minor', code: 'MINOR_ISSUE', label: 'Minor Touch Lag or Minor Spot', description: 'Small white pixel spot or edge touch issue', adjustmentType: 'FIXED', adjustmentValue: -1800, displayOrder: 2 },
      { id: 'a_pdt_lines', code: 'LINES_OR_BLEED', label: 'Display Lines / Screen Bleeding / Green Line', description: 'Green/pink vertical lines or black ink bleeding', adjustmentType: 'FIXED', adjustmentValue: -4500, displayOrder: 3 },
      { id: 'a_pdt_not_working', code: 'NOT_WORKING', label: 'Touch Not Working / Black Screen', description: 'Touch digitizer failed or blank screen', adjustmentType: 'FIXED', adjustmentValue: -7000, displayOrder: 4 },
    ],
  },
  {
    id: 'q_phone_screen_glass',
    categoryId: 'cat_smartphone',
    title: 'Physical Screen Glass Condition',
    subtitle: 'Inspect the front glass under direct light for cracks or scratches.',
    code: 'PHONE_SCREEN_GLASS',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 3,
    answers: [
      { id: 'a_psg_flawless', code: 'FLAWLESS', label: 'No Scratches / Pristine Glass', description: 'Like new condition', adjustmentType: 'FIXED', adjustmentValue: 500, displayOrder: 1 },
      { id: 'a_psg_minor', code: 'MINOR_SCRATCHES', label: 'Minor Hairline Scratches', description: 'Scratches barely visible with screen turned on', adjustmentType: 'FIXED', adjustmentValue: -800, displayOrder: 2 },
      { id: 'a_psg_deep', code: 'HEAVY_SCRATCHES', label: 'Deep Scratches', description: 'Fingernail catches in scratches', adjustmentType: 'FIXED', adjustmentValue: -2000, displayOrder: 3 },
      { id: 'a_psg_cracked', code: 'CRACKED', label: 'Cracked Front Glass', description: 'Cracks, chips, or shattered glass', adjustmentType: 'FIXED', adjustmentValue: -4000, displayOrder: 4 },
    ],
  },
  {
    id: 'q_phone_body',
    categoryId: 'cat_smartphone',
    title: 'Body, Frame & Back Panel Condition',
    subtitle: 'Check the metal/plastic side frame and rear glass for dents or bends.',
    code: 'PHONE_BODY',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 4,
    answers: [
      { id: 'a_pb_flawless', code: 'FLAWLESS', label: 'Flawless Body (No Dents)', description: 'Zero visible scuffs or dings', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_pb_minor_scuffs', code: 'MINOR_SCUFFS', label: 'Minor Scuffs / Case Marks', description: 'Tiny paint chips from daily case usage', adjustmentType: 'FIXED', adjustmentValue: -700, displayOrder: 2 },
      { id: 'a_pb_dents', code: 'DENTS_OR_BENT', label: 'Dents on Frame or Bent Body', description: 'Visible drop marks or bent chassis', adjustmentType: 'FIXED', adjustmentValue: -2500, displayOrder: 3 },
      { id: 'a_pb_cracked_back', code: 'CRACKED_BACK', label: 'Cracked / Shattered Back Glass', description: 'Rear panel is cracked', adjustmentType: 'FIXED', adjustmentValue: -3200, displayOrder: 4 },
    ],
  },
  {
    id: 'q_phone_cameras',
    categoryId: 'cat_smartphone',
    title: 'Front & Rear Cameras Functionality',
    subtitle: 'Test 0.5x, 1x, 3x zoom, autofocus, and video recording.',
    code: 'PHONE_CAMERAS',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 5,
    answers: [
      { id: 'a_pc_all_working', code: 'ALL_WORKING', label: 'All Cameras Work Perfectly', description: 'Crisp focus, no lens scratches or dust', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_pc_minor_blur', code: 'BLUR_OR_DUST', label: 'Minor Blur / Dust inside Lens', description: 'Autofocus is slightly sluggish or dusty', adjustmentType: 'FIXED', adjustmentValue: -1500, displayOrder: 2 },
      { id: 'a_pc_broken', code: 'CAMERA_DEFECTIVE', label: 'One or More Cameras Not Working', description: 'Black screen on camera app or lens cracked', adjustmentType: 'FIXED', adjustmentValue: -3500, displayOrder: 3 },
    ],
  },
  {
    id: 'q_phone_biometrics',
    categoryId: 'cat_smartphone',
    title: 'Face ID / Touch ID / Fingerprint Sensor',
    subtitle: 'Check biometric security unlock functionality.',
    code: 'PHONE_BIOMETRICS',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 6,
    answers: [
      { id: 'a_pbio_working', code: 'WORKING', label: 'Face ID / Fingerprint Works Perfectly', description: 'Fast biometric unlock', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_pbio_failed', code: 'FAILED', label: 'Biometrics Defective / Disabled', description: 'Face ID / Fingerprint sensor not available', adjustmentType: 'FIXED', adjustmentValue: -2500, displayOrder: 2 },
    ],
  },
  {
    id: 'q_phone_battery',
    categoryId: 'cat_smartphone',
    title: 'Battery Health & Charging Port',
    subtitle: 'Does the phone charge reliably and hold charge throughout the day?',
    code: 'PHONE_BATTERY',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 7,
    answers: [
      { id: 'a_pbat_excellent', code: 'EXCELLENT', label: 'Healthy Battery (>85% health)', description: 'Lasts full day, charges rapidly without overheating', adjustmentType: 'FIXED', adjustmentValue: 600, displayOrder: 1 },
      { id: 'a_pbat_average', code: 'AVERAGE', label: 'Moderate Drain (75% - 84%)', description: 'Requires mid-day top-up occasionally', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 2 },
      { id: 'a_pbat_poor', code: 'POOR', label: 'Service Recommended (<75% / Battery Warning)', description: 'Drains very fast or service alert displayed', adjustmentType: 'FIXED', adjustmentValue: -1800, displayOrder: 3 },
    ],
  },
  {
    id: 'q_phone_locks',
    categoryId: 'cat_smartphone',
    title: 'Device Account Locks (iCloud / Google FRP / Knox / MDM)',
    subtitle: 'Is the phone logged out and ready for resale without activation locks?',
    code: 'PHONE_LOCKS',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 8,
    answers: [
      { id: 'a_plock_none', code: 'NO_LOCKS', label: 'Clean Device (No Account Lock)', description: 'You can remove iCloud/Google account and factory reset', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_plock_locked', code: 'LOCKED', label: 'Locked with Forgotten Password / MDM Lock', description: 'Device cannot be unlinked from Apple ID or Google', adjustmentType: 'FIXED', adjustmentValue: 0, isRejection: true, warningMessage: 'We cannot purchase account-locked devices due to legal and security policies.', displayOrder: 2 },
    ],
  },
  {
    id: 'q_phone_accessories',
    categoryId: 'cat_smartphone',
    title: 'Original Box, Bill & Charger Available?',
    subtitle: 'Original invoice and packaging boost your payout significantly.',
    code: 'PHONE_ACCESSORIES',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 9,
    answers: [
      { id: 'a_pacc_all', code: 'BOX_BILL_CHARGER', label: 'All Original (Box + Bill + Charger)', description: 'Complete retail packaging and official tax invoice', adjustmentType: 'FIXED', adjustmentValue: 1200, displayOrder: 1 },
      { id: 'a_pacc_bill_box', code: 'BILL_AND_BOX', label: 'Original Bill & Box only', description: 'Valid invoice and matching IMEI box', adjustmentType: 'FIXED', adjustmentValue: 700, displayOrder: 2 },
      { id: 'a_pacc_box_only', code: 'BOX_ONLY', label: 'Original Box Only', description: 'Matching IMEI retail box', adjustmentType: 'FIXED', adjustmentValue: 300, displayOrder: 3 },
      { id: 'a_pacc_none', code: 'DEVICE_ONLY', label: 'Device Only (No Box or Bill)', description: 'Valid Govt ID will be verified during pickup', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 4 },
    ],
  },

  // ================= LAPTOP QUESTIONS =================
  {
    id: 'q_lap_power',
    categoryId: 'cat_laptop',
    title: 'Does the laptop boot up and display desktop?',
    subtitle: 'Laptop starts cleanly into Windows / macOS / Linux OS.',
    code: 'LAPTOP_POWER',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 1,
    answers: [
      { id: 'a_lp_yes', code: 'YES', label: 'Yes, boots up perfectly', description: 'Powers on smoothly without BIOS or motherboard errors', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_lp_no', code: 'NO', label: 'No, does not turn on (Dead / No Display)', description: 'Motherboard or power circuitry failure', adjustmentType: 'PERCENTAGE', adjustmentValue: -65, displayOrder: 2 },
    ],
  },
  {
    id: 'q_lap_screen',
    categoryId: 'cat_laptop',
    title: 'Laptop Screen & Hinge Condition',
    subtitle: 'Check for dead pixels, screen bleed, cracks, and hinge tightness.',
    code: 'LAPTOP_SCREEN',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 2,
    answers: [
      { id: 'a_ls_flawless', code: 'FLAWLESS', label: 'Flawless Screen & Tight Hinges', description: 'Crisp bright panel, no lines or dead pixels', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_ls_scratches', code: 'KEYBOARD_MARKS', label: 'Minor Keyboard Marks on Anti-reflective Coating', description: 'Common light coating scuffs from keyboard contact', adjustmentType: 'FIXED', adjustmentValue: -1500, displayOrder: 2 },
      { id: 'a_ls_lines', code: 'LINES_OR_WHITE_SPOTS', label: 'White Pressure Spots or Vertical Lines', description: 'Visible pressure marks or pixel lines', adjustmentType: 'FIXED', adjustmentValue: -4000, displayOrder: 3 },
      { id: 'a_ls_cracked', code: 'CRACKED_OR_BROKEN_HINGE', label: 'Cracked Screen or Broken Hinge', description: 'Glass/panel cracked or loose broken hinge', adjustmentType: 'FIXED', adjustmentValue: -8500, displayOrder: 4 },
    ],
  },
  {
    id: 'q_lap_keyboard_trackpad',
    categoryId: 'cat_laptop',
    title: 'Keyboard, Trackpad & Ports',
    subtitle: 'Test all keyboard keys, backlight, trackpad click, and USB/Type-C ports.',
    code: 'LAPTOP_KEYBOARD_TRACKPAD',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 3,
    answers: [
      { id: 'a_lkt_perfect', code: 'ALL_FUNCTIONAL', label: 'All Keys & Ports Work 100%', description: 'Smooth typing, responsive trackpad and tight ports', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_lkt_few_keys', code: 'FEW_KEYS_OR_PORT_DEFECT', label: '1-3 Defective Keys or Broken USB Port', description: 'Requires keyboard replacement or minor port issue', adjustmentType: 'FIXED', adjustmentValue: -2200, displayOrder: 2 },
      { id: 'a_lkt_trackpad_dead', code: 'KEYBOARD_TRACKPAD_FAILED', label: 'Keyboard / Trackpad Non-Functional', description: 'Spill damage or total keyboard failure', adjustmentType: 'FIXED', adjustmentValue: -4500, displayOrder: 3 },
    ],
  },
  {
    id: 'q_lap_battery',
    categoryId: 'cat_laptop',
    title: 'Laptop Battery Health & Backup',
    subtitle: 'How long does the battery last on a single full charge?',
    code: 'LAPTOP_BATTERY',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 4,
    answers: [
      { id: 'a_lbat_healthy', code: 'HEALTHY', label: 'Good Battery (3+ Hours Backup)', description: 'Holds strong charge, normal cycle count', adjustmentType: 'FIXED', adjustmentValue: 800, displayOrder: 1 },
      { id: 'a_lbat_moderate', code: 'MODERATE', label: 'Moderate Backup (1 to 2 Hours)', description: 'Aging battery, holds partial charge', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 2 },
      { id: 'a_lbat_dead', code: 'DEAD_ONLY_CHARGER', label: 'Works Only When Plugged In (Dead Battery)', description: 'Laptop shuts down immediately when unplugged', adjustmentType: 'FIXED', adjustmentValue: -3000, displayOrder: 3 },
    ],
  },
  {
    id: 'q_lap_body',
    categoryId: 'cat_laptop',
    title: 'Chassis & Outer Shell Condition',
    subtitle: 'Check top lid, palm rest, bottom case for dents, cracks, or loose screws.',
    code: 'LAPTOP_BODY',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 5,
    answers: [
      { id: 'a_lb_flawless', code: 'FLAWLESS', label: 'Flawless Aluminum/Carbon Chassis', description: 'No dents or chipped corners', adjustmentType: 'FIXED', adjustmentValue: 0, displayOrder: 1 },
      { id: 'a_lb_minor', code: 'MINOR_SIGNS', label: 'Minor Scratches / Palm Rest Gloss', description: 'Normal desk wear without physical cracks', adjustmentType: 'FIXED', adjustmentValue: -1000, displayOrder: 2 },
      { id: 'a_lb_dented', code: 'DENTS_OR_CHIPS', label: 'Corner Dents or Missing Screws', description: 'Visible impact marks or chipped corners', adjustmentType: 'FIXED', adjustmentValue: -3000, displayOrder: 3 },
      { id: 'a_lb_broken', code: 'BROKEN_PANEL', label: 'Cracked Body or Broken Casing', description: 'Physical casing breakage', adjustmentType: 'FIXED', adjustmentValue: -5500, displayOrder: 4 },
    ],
  },
  {
    id: 'q_lap_accessories',
    categoryId: 'cat_laptop',
    title: 'Original Charger & Accessories',
    subtitle: 'Original high-wattage power adapter and original box.',
    code: 'LAPTOP_ACCESSORIES',
    questionType: 'SINGLE_CHOICE',
    displayOrder: 6,
    answers: [
      { id: 'a_lacc_full', code: 'ORIGINAL_CHARGER_AND_BOX', label: 'Original Power Adapter + Box + Bill', description: 'Original fast charger and packaging', adjustmentType: 'FIXED', adjustmentValue: 1500, displayOrder: 1 },
      { id: 'a_lacc_charger_only', code: 'ORIGINAL_CHARGER_ONLY', label: 'Original Power Adapter Only', description: 'OEM authentic laptop charger', adjustmentType: 'FIXED', adjustmentValue: 600, displayOrder: 2 },
      { id: 'a_lacc_none', code: 'NO_CHARGER', label: 'No Charger / Compatible Third-Party Charger', description: 'Missing original power brick', adjustmentType: 'FIXED', adjustmentValue: -1800, displayOrder: 3 },
    ],
  },
];

export const SEED_TESTIMONIALS = [
  {
    id: 'test_1',
    customerName: 'Rahul Sharma',
    location: 'Bengaluru, Karnataka',
    deviceSold: 'Apple iPhone 15 Pro (256GB)',
    rating: 5,
    reviewText: 'Got ₹54,000 within 15 minutes of the pickup agent arriving at my Indiranagar flat! Seamless UPI transfer and no bargaining. 10/10 experience.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    id: 'test_2',
    customerName: 'Priya Venkatesh',
    location: 'Hyderabad, Telangana',
    deviceSold: 'MacBook Air M2 (16GB)',
    rating: 5,
    reviewText: 'Sold my 2-year-old MacBook Air for ₹51,500. The valuation was higher than local tech markets and they sanitized the drive right in front of me.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    id: 'test_3',
    customerName: 'Aman Verma',
    location: 'Gurugram, NCR',
    deviceSold: 'Samsung Galaxy S23 Ultra',
    rating: 5,
    reviewText: 'Super fast doorstep pickup. Agent verified screen and camera with automated diagnostic app, confirmed full quotation price, and IMPS hit my account immediately.',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
  {
    id: 'test_4',
    customerName: 'Ananya Iyer',
    location: 'Mumbai, Maharashtra',
    deviceSold: 'Dell XPS 15 9530',
    rating: 5,
    reviewText: 'TrustMyGadget is lightyears ahead of other resale platforms. The valuation questionnaire was very fair and transparent.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isFeatured: true,
  },
];

export const SEED_FAQS = [
  {
    id: 'faq_1',
    category: 'Valuation',
    question: 'How is my device price calculated by TrustMyGadget?',
    answer: 'Our proprietary dynamic valuation engine evaluates real-time Indian secondary market indices, your device brand, model, storage/RAM variant, and exact functional condition (display health, battery cycle, body scratches, and original accessories). The quote you see is what you get with zero hidden deductions.',
    displayOrder: 1,
    isFeatured: true,
  },
  {
    id: 'faq_2',
    category: 'Pickup & Payment',
    question: 'Is doorstep device pickup completely free?',
    answer: 'Yes! Doorstep pickup is 100% free across 19,000+ pincodes in India. Our verified logistics agent visits your home or office at your chosen convenient date and time slot.',
    displayOrder: 2,
    isFeatured: true,
  },
  {
    id: 'faq_3',
    category: 'Pickup & Payment',
    question: 'When and how will I receive the payment?',
    answer: 'Payment is instantaneous! Once our verification executive performs a 5-minute diagnostic test and confirms your device condition, the full agreed payout is transferred immediately to your UPI ID (Google Pay, PhonePe, Paytm) or direct Bank IMPS.',
    displayOrder: 3,
    isFeatured: true,
  },
  {
    id: 'faq_5',
    category: 'Device Condition',
    question: 'Do you buy cracked or damaged smartphones and dead laptops?',
    answer: 'Yes! We purchase devices in almost all conditions—from pristine boxed units to cracked screens and non-booting dead motherboards. Simply select the accurate condition in our valuation wizard to receive a fair scrap/refurbishment value.',
    displayOrder: 5,
    isFeatured: true,
  },
  {
    id: 'faq_6',
    category: 'General',
    question: 'What documents do I need to hand over during pickup?',
    answer: 'You only need to show a valid Government Photo ID (Aadhaar Card, Driver License, or Passport) for regulatory compliance and ownership verification. If you have the original purchase invoice, having that handy gets you an extra bonus payout!',
    displayOrder: 6,
    isFeatured: false,
  },
];

export const SEED_BLOGS = [
  {
    id: 'blog_1',
    title: 'How to Sell Your Old iPhone for the Maximum Resale Value in India',
    slug: 'how-to-sell-old-iphone-maximum-resale-value',
    excerpt: 'Step-by-step checklist to prepare your iPhone: battery preservation, finding original accessories, and timing your sale before new launch cycles.',
    content: `When upgrading to a new smartphone, selling your existing device can fund up to 60-70% of your new flagship. Here are expert tips to lock in top value on TrustMyGadget:

1. **Keep Your Battery Health Above 80%**: Lithium-ion battery health is one of the highest weighted factors in secondary market pricing.
2. **Preserve the Original Box & Bill**: In India, having the original VAT/GST invoice and matching IMEI retail packaging can add between ₹1,000 to ₹3,000 to your cash quote.
3. **Clean and Sanitize Gently**: Avoid harsh alcohol solvents on oleophobic glass coatings. Use a micro-fiber cloth to remove dust from speaker grilles and charging port.
4. **Time Your Sale Wisely**: Device values depreciate fastest right after a new generation announcement (e.g., September for iPhones). Selling 3-4 weeks prior nets you the peak price.`,
    coverImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    author: 'Adarsh Gupta (Tech Valuation Lead)',
    category: 'Selling Guide',
    readTime: '4 min read',
    publishedAt: new Date(),
    seoTitle: 'How to Sell Old iPhone for Maximum Resale Value in India - TrustMyGadget',
    seoDescription: 'Maximize your used iPhone selling price in India with this comprehensive guide on timing, battery health, and original bill valuation bonuses.',
  },
  {
    id: 'blog_2',
    title: '5 Crucial Things to Check Before Selling Your Used Laptop in 2025',
    slug: 'crucial-things-to-check-before-selling-used-laptop',
    excerpt: 'Don’t leave private files behind. Learn how to secure-wipe SSDs, check thermal throttling, and test keyboard switches.',
    content: `Selling a laptop requires extra care due to sensitive work documents, tax filings, and browser tokens stored across solid-state drives.

- **Step 1: Complete Cloud Backup**: Sync your documents, browser bookmarks, and developer keys to OneDrive, Google Drive, or iCloud.
- **Step 2: Sign Out of OEM Licenses**: Deactivate Adobe Creative Cloud, Microsoft Office 365, and OEM device manager tools.
- **Step 3: Cryptographic SSD Wipe**: Quick formats do not erase NAND flash blocks. Perform a BitLocker reset or cryptographic SSD secure erase.
- **Step 4: Pack the High-Wattage OEM Adapter**: Laptop resale values drop significantly if the original charger is missing because genuine 65W–240W gallium nitride bricks cost up to ₹4,000.`,
    coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    author: 'Vikram Mehta (Hardware Specialist)',
    category: 'Laptop Care',
    readTime: '5 min read',
    publishedAt: new Date(),
    seoTitle: 'Things to Check Before Selling Used Laptop - TrustMyGadget',
    seoDescription: 'Complete checklist for wiping and preparing your used Dell, HP, Lenovo or MacBook before selling online.',
  },
  {
    id: 'blog_3',
    title: 'How Device Resale Prices Are Calculated: Inside the TrustMyGadget Algorithm',
    slug: 'how-device-resale-prices-are-calculated',
    excerpt: 'A transparent deep dive into base market demand, depreciation curves, component grading, and dynamic pricing rules.',
    content: `Unlike traditional second-hand shops that negotiate arbitrarily, TrustMyGadget operates on an algorithmic pricing engine.

### The 4 Pillars of Device Valuation:
1. **Base Secondary Index**: Real-time aggregation of thousands of secondary sales across Mumbai, Delhi, Bengaluru, Hyderabad, and Chennai.
2. **Grade-A Component Weighting**: Valuation of internal components like OLED displays, motherboard chips, and battery cycle counts.
3. **Hierarchical Deductions**: Clear, line-by-line itemized adjustments for cracked glass, camera spot, or housing scratches.
4. **Retail Packaging Bonuses**: Direct cash additions for original retail invoices and chargers.`,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    author: 'TrustMyGadget Research Desk',
    category: 'Industry Insights',
    readTime: '6 min read',
    publishedAt: new Date(),
    seoTitle: 'How Device Resale Prices Are Calculated - TrustMyGadget',
    seoDescription: 'Discover the transparent algorithmic valuation engine behind TrustMyGadget instant quotes.',
  },
];

export const SEED_BANNERS = [
  {
    id: 'ban_1',
    title: 'Your Old Phone Has More Value Than You Think',
    subtitle: 'Get up to ₹85,000 instant cash for your iPhone, Samsung Galaxy, or OnePlus with free doorstep pickup today.',
    badgeText: 'INSTANT CASH OFFER',
    desktopImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    ctaText: 'Sell Your Phone',
    ctaUrl: '/sell/smartphones',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'ban_2',
    title: 'Turn Your Old Laptop Into Instant Bank Transfer',
    subtitle: 'Selling MacBooks, Dell XPS, HP Pavilion, and Gaming rigs is now 100% hassle-free with free data wiping.',
    badgeText: 'TOP LAPTOP VALUATION',
    desktopImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    ctaText: 'Sell Your Laptop',
    ctaUrl: '/sell/laptops',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'ban_3',
    title: 'Fast. Transparent. Trusted.',
    subtitle: 'Over 150,000+ happy customers across 19,000+ Indian pincodes. Instant UPI payout at your doorstep.',
    badgeText: 'INDIA’S #1 RESALE PLATFORM',
    desktopImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    ctaText: 'Check Device Value',
    ctaUrl: '/sell',
    displayOrder: 3,
    isActive: true,
  },
];

export const SEED_ADMIN_ROLES = [
  {
    id: 'role_super_admin',
    name: 'Super Admin',
    slug: 'super_admin',
    description: 'Full unrestricted access to all platform systems, financials, orders, and configuration.',
    permissions: JSON.stringify(['ALL', 'CATALOG_MANAGE', 'RULES_MANAGE', 'ORDERS_MANAGE', 'VERIFICATION_MANAGE', 'CMS_MANAGE', 'SETTINGS_MANAGE', 'USERS_MANAGE', 'AUDIT_VIEW']),
  },
  {
    id: 'role_ops_mgr',
    name: 'Operations Manager',
    slug: 'operations_manager',
    description: 'Manages order dispatch, agent assignments, pickup schedules, and customer escalations.',
    permissions: JSON.stringify(['ORDERS_MANAGE', 'VERIFICATION_MANAGE', 'CATALOG_VIEW', 'SUPPORT_MANAGE']),
  },
  {
    id: 'role_verify_agent',
    name: 'Verification Agent',
    slug: 'verification_agent',
    description: 'Inspects devices during pickup, performs physical grading, adjusts final quotes, and requests payouts.',
    permissions: JSON.stringify(['VERIFICATION_MANAGE', 'ORDERS_VIEW', 'ORDERS_UPDATE_STATUS']),
  },
  {
    id: 'role_content_mgr',
    name: 'Content Manager',
    slug: 'content_manager',
    description: 'Manages banners, blogs, FAQs, SEO metadata, and promotional campaigns.',
    permissions: JSON.stringify(['CMS_MANAGE', 'BLOG_MANAGE', 'FAQ_MANAGE', 'BANNERS_MANAGE']),
  },
  {
    id: 'role_support',
    name: 'Support Agent',
    slug: 'support_agent',
    description: 'Handles customer queries, order tracking requests, and ticket resolutions.',
    permissions: JSON.stringify(['SUPPORT_MANAGE', 'ORDERS_VIEW', 'USERS_VIEW']),
  },
];

export const SEED_ADMIN_USERS = [
  {
    id: 'adm_super',
    username: 'admin',
    email: 'admin@trustmygadget.com',
    passwordHash: 'admin123', // In real production, hash with bcrypt/argon2
    name: 'Vikram Singhania (Director)',
    roleSlug: 'super_admin',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'adm_ops',
    username: 'ops_lead',
    email: 'ops@trustmygadget.com',
    passwordHash: 'ops123',
    name: 'Deepak Rao (Ops Lead)',
    roleSlug: 'operations_manager',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'adm_verify',
    username: 'agent_kiran',
    email: 'kiran.agent@trustmygadget.com',
    passwordHash: 'agent123',
    name: 'Kiran Patel (Senior Field Inspector)',
    roleSlug: 'verification_agent',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
];

export const SEED_ORDERS: any[] = [];
