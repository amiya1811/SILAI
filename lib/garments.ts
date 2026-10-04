// ========================================================
// SILAI - Garment Categories & Measurement Field Templates
// ========================================================

export interface MeasurementFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  tip?: string;
  required?: boolean;
}

export const ALL_GARMENT_CATEGORIES = [
  "Blouse",
  "Saree Blouse",
  "Designer Blouse",
  "Kurti",
  "Straight Kurti",
  "Anarkali",
  "Salwar",
  "Salwar Suit",
  "Palazzo",
  "Churidar",
  "Lehenga",
  "Lehenga Blouse",
  "Saree",
  "Dress",
  "Gown",
  "Maxi Dress",
  "Midi Dress",
  "Shirt",
  "Formal Shirt",
  "Casual Shirt",
  "T-Shirt",
  "Polo T-Shirt",
  "Pants",
  "Trousers",
  "Jeans",
  "Shorts",
  "Skirt",
  "Jumpsuit",
  "Co-ord Set",
  "Suit",
  "Sherwani",
  "Kurta",
  "Pajama",
  "Nehru Jacket",
  "Waistcoat",
  "Jacket",
  "Coat",
  "Kids Wear",
  "School Uniform",
  "College Uniform",
  "Corporate Uniform",
  "Bridal Wear",
  "Wedding Wear",
  "Ethnic Wear",
  "Western Wear",
  "Alteration",
  "Custom",
] as const;

export type GarmentCategoryName = (typeof ALL_GARMENT_CATEGORIES)[number];

// Standard measurement fields for garment families
export const GARMENT_MEASUREMENT_TEMPLATES: Record<string, MeasurementFieldDef[]> = {
  // Blouses
  BLOUSE: [
    { key: "bust", label: "Bust", placeholder: "36", required: true, tip: "Fullest part of bust over apex" },
    { key: "underbust", label: "Under Bust", placeholder: "31", required: true, tip: "Directly under the bra band line" },
    { key: "waist", label: "Waist", placeholder: "28", required: true, tip: "Natural waistline above navel" },
    { key: "shoulder", label: "Shoulder Width", placeholder: "14.5", required: true, tip: "Bone to bone across upper back" },
    { key: "armhole", label: "Armhole", placeholder: "16", required: true, tip: "Around the circumference of armscye" },
    { key: "sleeveLength", label: "Sleeve Length", placeholder: "10.5", required: true, tip: "Shoulder tip to desired sleeve hem" },
    { key: "bicep", label: "Bicep", placeholder: "12", tip: "Around fullest part of upper arm" },
    { key: "blouseLength", label: "Blouse Length", placeholder: "14.5", required: true, tip: "Shoulder point down to blouse hem" },
    { key: "frontNeckDepth", label: "Front Neck Depth", placeholder: "7", tip: "Shoulder seam down to front neckline drop" },
    { key: "backNeckDepth", label: "Back Neck Depth", placeholder: "9.5", tip: "Shoulder seam down to back neckline drop" },
  ],

  // Kurtis & Tunics
  KURTI: [
    { key: "bust", label: "Bust / Chest", placeholder: "36", required: true, tip: "Around the fullest part of bust" },
    { key: "waist", label: "Waist", placeholder: "30", required: true, tip: "Natural waistline curve" },
    { key: "hip", label: "Hip", placeholder: "39", required: true, tip: "Fullest circumference of hips" },
    { key: "shoulder", label: "Shoulder", placeholder: "14.5", required: true, tip: "Shoulder bone to bone across back" },
    { key: "armhole", label: "Armhole", placeholder: "16.5", tip: "Comfortable armhole circumference" },
    { key: "sleeveLength", label: "Sleeve Length", placeholder: "17", tip: "From shoulder seam to cuff hem" },
    { key: "bicep", label: "Bicep", placeholder: "12.5", tip: "Upper arm circumference" },
    { key: "kurtiLength", label: "Kurti Length", placeholder: "42", required: true, tip: "High point shoulder to desired hem" },
    { key: "neckDepth", label: "Front Neck Depth", placeholder: "6.5", tip: "Vertical drop from shoulder seam" },
    { key: "slitCut", label: "Side Slit Opening", placeholder: "19", tip: "Armpit down to where side slit opens" },
  ],

  // Pants, Trousers, Jeans, Shorts, Pajamas
  PANTS: [
    { key: "waist", label: "Waist", placeholder: "30", required: true, tip: "Where you wear your trousers" },
    { key: "hip", label: "Hip", placeholder: "38", required: true, tip: "Fullest part of buttocks/seat" },
    { key: "rise", label: "Rise", placeholder: "11", tip: "Crotch seam up to waistband" },
    { key: "thigh", label: "Thigh", placeholder: "22", tip: "Fullest part of upper thigh" },
    { key: "knee", label: "Knee", placeholder: "16", tip: "Around the knee cap" },
    { key: "bottomOpening", label: "Bottom Opening / Hem", placeholder: "13", tip: "Ankle cuff opening circumference" },
    { key: "inseam", label: "Inseam", placeholder: "29", tip: "Inside leg from crotch to floor/ankle" },
    { key: "outseam", label: "Outseam / Length", placeholder: "39", required: true, tip: "Waistband top down to hem edge" },
  ],

  // Shirts & Tops
  SHIRT: [
    { key: "chest", label: "Chest", placeholder: "38", required: true, tip: "Around fullest part under armpits" },
    { key: "waist", label: "Waist / Stomach", placeholder: "33", required: true, tip: "Around belly/navel level" },
    { key: "shoulder", label: "Shoulder Width", placeholder: "17.5", required: true, tip: "Across upper back bone to bone" },
    { key: "armhole", label: "Armhole", placeholder: "18", tip: "Circumference around shoulder joint" },
    { key: "sleeveLength", label: "Sleeve Length", placeholder: "24.5", required: true, tip: "Shoulder edge to wrist bone" },
    { key: "bicep", label: "Bicep", placeholder: "13.5", tip: "Fullest part of bicep muscle" },
    { key: "shirtLength", label: "Shirt Length", placeholder: "29", required: true, tip: "Base of back collar to bottom hem" },
    { key: "neck", label: "Neck / Collar", placeholder: "15.5", required: true, tip: "Around base of neck with one finger room" },
  ],

  // Dresses & Gowns
  DRESS: [
    { key: "bust", label: "Bust", placeholder: "35", required: true, tip: "Fullest part of bust" },
    { key: "waist", label: "Waist", placeholder: "28", required: true, tip: "Natural waist indentation" },
    { key: "hip", label: "Hip", placeholder: "38", required: true, tip: "Widest part of hips" },
    { key: "shoulder", label: "Shoulder", placeholder: "14", tip: "Across shoulders" },
    { key: "armhole", label: "Armhole", placeholder: "16", tip: "Arm opening comfort" },
    { key: "sleeveLength", label: "Sleeve Length", placeholder: "15", tip: "Shoulder to sleeve hem" },
    { key: "dressLength", label: "Dress Length", placeholder: "50", required: true, tip: "Shoulder to desired hemline" },
    { key: "neckDepth", label: "Neck Depth", placeholder: "7", tip: "Front neck drop" },
  ],

  // Lehenga & Skirts
  LEHENGA: [
    { key: "waist", label: "Waist / Navel", placeholder: "30", required: true, tip: "Exact point where lehenga sits" },
    { key: "hip", label: "Hip", placeholder: "39", required: true, tip: "Around fullest part of seat" },
    { key: "skirtLength", label: "Skirt Length", placeholder: "41", required: true, tip: "Waistband to floor (with heels on)" },
    { key: "waistToFloor", label: "Waist to Floor", placeholder: "42", tip: "Barefoot waist to floor" },
    { key: "thigh", label: "Thigh", placeholder: "22", tip: "For mermaid/fitted cut lehengas" },
  ],

  // Suits, Sherwanis, Jackets, Coats, Uniforms
  SUIT: [
    { key: "chest", label: "Chest / Bust", placeholder: "38", required: true, tip: "Fullest chest circumference" },
    { key: "waist", label: "Waist", placeholder: "32", required: true, tip: "Stomach circumference" },
    { key: "hip", label: "Hip", placeholder: "39", tip: "Hips circumference" },
    { key: "shoulder", label: "Shoulder Width", placeholder: "17", required: true, tip: "Across shoulders back" },
    { key: "armhole", label: "Armhole", placeholder: "18", tip: "Circumference of armscye" },
    { key: "sleeveLength", label: "Sleeve Length", placeholder: "24", required: true, tip: "Shoulder point to wrist" },
    { key: "garmentLength", label: "Jacket / Suit Length", placeholder: "30", required: true, tip: "Back collar to jacket hem" },
    { key: "neck", label: "Neck / Collar", placeholder: "16", tip: "Collar band for bandhgala / sherwani" },
  ],

  // Kids Wear
  KIDS: [
    { key: "ageOrSize", label: "Age / Size", placeholder: "4-5 Years", required: true, tip: "Standard kids clothing age or tag size" },
    { key: "totalHeight", label: "Child Total Height", placeholder: "42", required: true, tip: "Crown of head down to floor" },
    { key: "chest", label: "Chest", placeholder: "23", required: true, tip: "Around chest under arms" },
    { key: "waist", label: "Waist", placeholder: "21", required: true, tip: "Natural waistline" },
    { key: "shoulder", label: "Shoulder", placeholder: "10.5", tip: "Shoulder to shoulder" },
    { key: "garmentLength", label: "Garment Length", placeholder: "24", tip: "Shoulder to desired hem" },
    { key: "sleeveLength", label: "Sleeve Length", placeholder: "14", tip: "Shoulder to wrist" },
  ],

  // Alterations
  ALTERATION: [
    { key: "areaOfAlteration", label: "Area of Alteration", placeholder: "Waist, Sleeves, Hem, Shoulders", required: true, tip: "Garment section that needs resizing" },
    { key: "currentMeasurement", label: "Current Measurement", placeholder: "32", tip: "How much the garment currently measures" },
    { key: "targetMeasurement", label: "Target Desired Measurement", placeholder: "29", required: true, tip: "Your exact desired final fitting size" },
    { key: "alterationDetails", label: "Alteration Details", placeholder: "Take in waist 2 inches, shorten hem 1 inch", tip: "Specific changes you require" },
  ],

  // Saree Petticoat & Specs
  SAREE: [
    { key: "petticoatWaist", label: "Petticoat Waist", placeholder: "30", required: true, tip: "Where drawstring sits securely" },
    { key: "petticoatLength", label: "Petticoat Length", placeholder: "38", required: true, tip: "Waist to floor ankle clearance" },
    { key: "petticoatHip", label: "Petticoat Hip", placeholder: "39", tip: "Hip comfort room" },
    { key: "sareeFallPico", label: "Fall & Pico Option", placeholder: "Cotton Fall + Machine Pico", tip: "Hem finish preferences" },
  ],
};

// Helper to resolve the template fields for any category
export function getFieldsForGarmentCategory(category: string): MeasurementFieldDef[] {
  const norm = category.toUpperCase().trim();

  // Custom has dynamic builder
  if (norm === "CUSTOM") {
    return [];
  }

  // Blouse variants
  if (norm.includes("BLOUSE")) {
    return GARMENT_MEASUREMENT_TEMPLATES.BLOUSE;
  }

  // Kurti / Anarkali / Kurta
  if (norm.includes("KURTI") || norm.includes("ANARKALI") || norm === "KURTA") {
    return GARMENT_MEASUREMENT_TEMPLATES.KURTI;
  }

  // Pants, Trousers, Jeans, Shorts, Palazzo, Churidar, Pajama, Salwar
  if (
    norm.includes("PANT") ||
    norm.includes("TROUSER") ||
    norm.includes("JEAN") ||
    norm.includes("SHORT") ||
    norm.includes("PALAZZO") ||
    norm.includes("CHURIDAR") ||
    norm.includes("PAJAMA") ||
    norm === "SALWAR"
  ) {
    return GARMENT_MEASUREMENT_TEMPLATES.PANTS;
  }

  // Shirts & Polo
  if (norm.includes("SHIRT") || norm.includes("T-SHIRT") || norm.includes("POLO")) {
    return GARMENT_MEASUREMENT_TEMPLATES.SHIRT;
  }

  // Dresses & Gowns
  if (norm.includes("DRESS") || norm.includes("GOWN") || norm.includes("JUMPSUIT") || norm.includes("CO-ORD")) {
    return GARMENT_MEASUREMENT_TEMPLATES.DRESS;
  }

  // Lehenga & Skirts
  if (norm.includes("LEHENGA") || norm.includes("SKIRT")) {
    return GARMENT_MEASUREMENT_TEMPLATES.LEHENGA;
  }

  // Kids Wear
  if (norm.includes("KID")) {
    return GARMENT_MEASUREMENT_TEMPLATES.KIDS;
  }

  // Alterations
  if (norm.includes("ALTER")) {
    return GARMENT_MEASUREMENT_TEMPLATES.ALTERATION;
  }

  // Saree
  if (norm === "SAREE") {
    return GARMENT_MEASUREMENT_TEMPLATES.SAREE;
  }

  // Suits, Sherwanis, Jackets, Coats, Uniforms, Ethnic, Bridal
  return GARMENT_MEASUREMENT_TEMPLATES.SUIT;
}
