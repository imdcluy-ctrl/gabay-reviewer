// Official CSC Exam Day Logistics & Requirements Checklist (§3.2, INV-027f)

export const CSC_CHECKLIST_VERSION = 1;

export interface ChecklistItem {
  id: string;
  category: 'mandatory' | 'supplies' | 'attire' | 'reminders';
  titleEn: string;
  titleTl: string;
  description: string;
  isRequired: boolean;
}

export const CSC_EXAM_CHECKLIST_ITEMS: ChecklistItem[] = [
  // Mandatory Verification Documents
  {
    id: 'nosa',
    category: 'mandatory',
    titleEn: 'Notice of School Assignment (NOSA)',
    titleTl: 'Notice of School Assignment (NOSA)',
    description: 'Printed copy of your official CSC NOSA indicating your assigned room and school venue.',
    isRequired: true,
  },
  {
    id: 'valid_id',
    category: 'mandatory',
    titleEn: 'Valid Government-Issued ID',
    titleTl: 'Katanggap-tanggap na Valid ID',
    description: 'Original valid ID (e.g. Passport, UMID, Driver License, PRC ID, PhilID, Postal ID) matching your application name.',
    isRequired: true,
  },
  {
    id: 'application_receipt',
    category: 'mandatory',
    titleEn: 'Application Receipt & Official Receipt',
    titleTl: 'Resibo ng Aplikasyon',
    description: 'Original CSC official receipt issued during exam registration (if applicable).',
    isRequired: true,
  },

  // Exam Supplies
  {
    id: 'lead_pencils',
    category: 'supplies',
    titleEn: 'Lead Pencils (No. 2 / HB)',
    titleTl: 'Lapis (No. 2 o HB)',
    description: 'At least 2 to 3 sharpened Lead Pencils (No. 2) for shading answer sheets.',
    isRequired: true,
  },
  {
    id: 'black_ballpen',
    category: 'supplies',
    titleEn: 'Black Ballpoint Pen',
    titleTl: 'Itim na Ballpen',
    description: 'Good quality black ballpoint pen for writing personal details and signing attendance.',
    isRequired: true,
  },
  {
    id: 'eraser_sharpener',
    category: 'supplies',
    titleEn: 'Eraser & Pencil Sharpener',
    titleTl: 'Pambura at Tasa',
    description: 'Clean rubber eraser and compact pencil sharpener.',
    isRequired: false,
  },
  {
    id: 'clear_envelope',
    category: 'supplies',
    titleEn: 'Clear Plastic Envelope',
    titleTl: 'Clear Plastic Envelope',
    description: 'Transparent clear plastic envelope to hold all documents and writing instruments.',
    isRequired: true,
  },

  // Attire & Personal Belongings
  {
    id: 'proper_attire',
    category: 'attire',
    titleEn: 'Decent Attire / Smart Casual',
    titleTl: 'Maayos at Dezenteng Kasuotan',
    description: 'Plain polo shirt / blouse and long pants. Sleeveless shirts, shorts, and slippers are strictly prohibited.',
    isRequired: true,
  },
  {
    id: 'face_mask',
    category: 'attire',
    titleEn: 'Face Mask (Optional/As required)',
    titleTl: 'Face Mask',
    description: 'Clean face mask in case required by specific venue health protocols.',
    isRequired: false,
  },

  // Arrival & Venue Reminders
  {
    id: 'early_arrival',
    category: 'reminders',
    titleEn: 'Early Venue Arrival (6:30 AM)',
    titleTl: 'Maagang Pagdating (Bago mag-6:30 AM)',
    description: 'Arrive at the testing center before 6:30 AM. Gates close strictly at 7:30 AM.',
    isRequired: true,
  },
  {
    id: 'water_snack',
    category: 'reminders',
    titleEn: 'Drinking Water & Light Snack',
    titleTl: 'Tubig at Meryenda',
    description: 'Clear plastic water bottle and light snack (biscuits) for consumption during allowed breaks.',
    isRequired: false,
  },
];

export interface ChecklistStats {
  totalCount: number;
  checkedCount: number;
  requiredTotal: number;
  requiredChecked: number;
  isReady: boolean;
}

export function computeChecklistStats(checkedIds: Set<string>): ChecklistStats {
  const totalCount = CSC_EXAM_CHECKLIST_ITEMS.length;
  const checkedCount = CSC_EXAM_CHECKLIST_ITEMS.filter(i => checkedIds.has(i.id)).length;

  const requiredItems = CSC_EXAM_CHECKLIST_ITEMS.filter(i => i.isRequired);
  const requiredTotal = requiredItems.length;
  const requiredChecked = requiredItems.filter(i => checkedIds.has(i.id)).length;

  const isReady = requiredChecked === requiredTotal;

  return {
    totalCount,
    checkedCount,
    requiredTotal,
    requiredChecked,
    isReady,
  };
}
