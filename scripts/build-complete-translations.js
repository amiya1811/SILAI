const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'translations');

// Read existing en.json and hi.json as base
const currentEn = JSON.parse(fs.readFileSync(path.join(targetDir, 'en.json'), 'utf8'));
const currentHi = JSON.parse(fs.readFileSync(path.join(targetDir, 'hi.json'), 'utf8'));

// Read existing overrides from generate-all-translations.js
const legacyScript = fs.readFileSync(path.join(__dirname, 'generate-all-translations.js'), 'utf8');

function extractObject(varName) {
  const marker = 'const ' + varName + ' = ';
  const start = legacyScript.indexOf(marker);
  if (start === -1) return {};
  const objStart = legacyScript.indexOf('{', start);
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let end = -1;

  for (let i = objStart; i < legacyScript.length; i++) {
    const ch = legacyScript[i];
    if (inString) {
      if (ch === stringChar && legacyScript[i - 1] !== '\\') {
        inString = false;
      }
    } else {
      if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
  }

  if (end === -1) return {};
  const code = legacyScript.substring(objStart, end + 1);
  try {
    return eval('(' + code + ')');
  } catch (e) {
    console.error('Failed to eval ' + varName, e);
    return {};
  }
}

const bnLegacy = extractObject('bnOverrides');
const taLegacy = extractObject('taOverrides');
const teLegacy = extractObject('teOverrides');
const knLegacy = extractObject('knOverrides');
const mrLegacy = extractObject('mrOverrides');
const guLegacy = extractObject('guOverrides');
const mlLegacy = extractObject('mlOverrides');
const paLegacy = extractObject('paOverrides');
const orLegacy = extractObject('orOverrides');
const asLegacy = extractObject('asOverrides');

console.log('Extracted legacy overrides:', {
  bn: Object.keys(bnLegacy).length,
  ta: Object.keys(taLegacy).length,
  te: Object.keys(teLegacy).length,
  kn: Object.keys(knLegacy).length,
  mr: Object.keys(mrLegacy).length,
  gu: Object.keys(guLegacy).length,
  ml: Object.keys(mlLegacy).length,
  pa: Object.keys(paLegacy).length,
  or: Object.keys(orLegacy).length,
  as: Object.keys(asLegacy).length,
});

// Deep merge helper
function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// 1. Extensions to en
const enExtensions = {
  booking: {
    commissionBadge: "BESPOKE ATELIER COMMISSION",
    masterArtisan: "Certified Master Artisan",
    fitGuarantee100: "100% Fit Guarantee",
    step1Title: "1. Select Service & Complexity",
    servicesAvailable: "Services Available",
    days: "Days",
    step2Title: "2. Garment Quantity",
    quantitySubtitle: "Standard luxury stitching per tailored piece",
    step3Title: "3. How Would You Like Your Fit Taken?",
    savedVault: "1. Saved Vault",
    savedVaultDesc: "Use saved profile",
    manualTape: "2. Manual Tape",
    manualTapeDesc: "Enter sizes now",
    cloneOutfit: "3. Clone Outfit",
    cloneOutfitDesc: "Pickup sample fit",
    doorstepVisit: "4. Doorstep Visit",
    doorstepVisitDesc: "Master visits home",
    chooseFromSaved: "Choose From Your Saved Profiles",
    createNewProfile: "Create New Profile",
    loadingProfiles: "Loading your saved fit profiles...",
    noProfilesFound: "No saved fit profiles found in your vault yet.",
    enterManuallyBtn: "Enter Measurements Manually",
    points: "Points",
    recommendedFor: "Recommended for",
    guidedTapeTitle: "Guided Tape Measurements",
    inches: "INCHES",
    cm: "CM",
    bustChest: "Bust / Chest",
    waist: "Waist",
    hips: "Hips",
    shoulder: "Shoulder",
    armhole: "Armhole",
    sleeveLength: "Sleeve Length",
    totalLength: "Total Length",
    neckDepth: "Neck Depth",
    sampleGarmentNotice: "Our delivery concierge will collect your best-fitting sample garment during fabric pickup. The tailor will duplicate its exact silhouettes and return both pieces.",
    doorstepVisitNotice: "A certified master tailor will visit your residence with styling books and measurement tapes to record comprehensive body parameters in person.",
    step4Title: "4. Design Reference & Style Preferences",
    originalReference: "Original Reference",
    referencePhotoLabel: "Reference Photo URL / Atelier Inspiration",
    referencePhotoPlaceholder: "https://images.unsplash.com/... or paste design link",
    referencePhotoNotice: "* The original reference image is saved directly to your commission and serves as the authoritative karigari guide.",
    necklinePref: "Neckline Preference",
    sleevePref: "Sleeve Style",
    silhouetteFit: "Silhouette & Fit",
    step5Title: "5. Order Notes / Special Stitching Instructions",
    notesPlaceholder: "e.g. Cotton voile inner lining, 1.5-inch side margin, latkan dori on back neck...",
    step6Title: "6. Confirm Contact & Doorstep Delivery Address",
    customerFullName: "Customer Full Name",
    phoneForOtp: "Phone Number (for Courier OTP)",
    pickupAddressLabel: "Doorstep Fabric Pickup Address",
    selectOnMap: "Select / Locate on Map",
    bangaloreAreaVerified: "✓ Bangalore Delivery Area",
    sameAddressCheckbox: "Finished garment delivery address is the same as pickup",
    returnDeliveryAddressLabel: "Doorstep Return Delivery Address",
    step7Title: "7. Promotional Code / Privilege Voucher",
    savedBadge: "Saved",
    applyCouponTitle: "Apply Coupon / Privilege Code",
    applyCouponSubtitle: "Check available discount vouchers for your order",
    applyBtn: "Apply",
    couponAppliedSuccess: "Applied ✓",
    couponSavingNotice: "You are saving with this commission privilege.",
    changeCoupon: "Change",
    removeCoupon: "Remove",
    priceSummaryTitle: "Transparent Price Summary Preview",
    basePriceLabel: "Base Price",
    pickupDeliveryFee: "Doorstep Pickup & Delivery",
    privilegePromo: "Privilege Promo",
    estimatedGst: "Estimated GST (5%)",
    finalPayable: "Estimated Final Payable",
    reviewOrderBtn: "Review Order & Confirmation",
    reviewTitle: "Order Review & Verification",
    reviewSubtitle: "Please verify your tailored garment parameters before final placement.",
    masterAtelier: "Master Atelier",
    garmentCraftsmanship: "Garment & Craftsmanship",
    service: "Service",
    quantity: "Quantity",
    complexity: "Complexity",
    estStitching: "Est. Stitching",
    fitSpecification: "Fit Specification",
    method: "Method",
    designStylingGuide: "Design & Styling Guide",
    neckline: "Neckline",
    sleeve: "Sleeve",
    fit: "Fit",
    attachedReference: "Attached Reference Image Preview",
    customerLogistics: "Customer Contact & Logistics",
    pickupLocation: "Pickup Location",
    returnDelivery: "Return Delivery",
    priceBreakdown: "Transparent Price Breakdown",
    stitchingSubtotal: "Stitching Subtotal",
    backToEdit: "Back to Edit",
    placeOrderCod: "Place Order (Cash on Delivery)",
    proceedToPay: "Proceed to Pay",
    creatingOrder: "Creating your order...",
    confirmationVerified: "CONFIRMATION VERIFIED",
    orderSuccessTitle: "Order Placed Successfully",
    orderSuccessSubtitle: "Your bespoke commission has been recorded in our permanent master ledger.",
    orderNumberLabel: "Order Number",
    paymentLabel: "Payment",
    initialStatus: "Initial Order Status",
    amountPaidRazorpay: "Amount Paid (Razorpay Verified)",
    trackOrderBtn: "Track Order",
    doneBtn: "Done"
  },
  address: {
    modalTitle: "Delivery Address & Coordinates",
    modalSubtitle: "Bengaluru Metro Service Area (Real-time GPS Pinpoint)",
    savedAddressesTab: "Saved Addresses",
    enterAddressTab: "Enter Address",
    locateOnMapTab: "Locate on Map",
    selectDeliveryLocation: "Select Delivery Location",
    addNew: "Add New",
    defaultBadge: "DEFAULT",
    coordinates: "Coordinates",
    saveAddressAs: "Save Address As",
    home: "Home",
    work: "Work",
    other: "Other",
    flatHouseNumber: "Flat, House No., Building, Apartment *",
    flatHousePlaceholder: "e.g. Flat 302, Prestige Silver Springs",
    streetRoad: "Street, Road or Lane",
    streetRoadPlaceholder: "e.g. 100 Feet Road, 4th Cross",
    areaLocality: "Area, Locality *",
    areaLocalityPlaceholder: "e.g. Indiranagar / Koramangala",
    postalPincode: "Postal Pincode *",
    postalPincodePlaceholder: "e.g. 560038",
    city: "City",
    state: "State",
    landmark: "Nearby Landmark (Optional)",
    landmarkPlaceholder: "e.g. Opposite Sony Center / Near Metro Station",
    pinPreview: "Exact Delivery Pin Preview",
    clickToFineTune: "Click map to fine-tune",
    setAsDefault: "Set this as my default delivery address",
    confirmUseThis: "Confirm & Use This Address",
    savingAddress: "Saving Address...",
    mapHint: "Position the pin at your delivery doorstep or click the crosshair icon to use your GPS location.",
    detectedLocation: "Detected Location",
    confirmPinAddDetails: "Confirm Pin & Add House/Flat Details",
    validationError: "Please provide your house/flat number and area name.",
    saveError: "Failed to save address.",
    networkError: "A network error occurred while saving."
  },
  delivery: {
    fleetDutyOnline: "Fleet Duty: ONLINE",
    fleetDutyOffline: "Fleet Duty: OFFLINE",
    gpsTelemetryLive: "GPS telemetry live (15s)",
    gpsStandby: "GPS Standby",
    fourMomentSecurity: "Mandatory 4-Moment Photo Security Check",
    disputeProofGuarantee: "Dispute-Proof Guarantee",
    moment1Title: "Moment 1",
    moment1Desc: "Customer Pickup + Package Condition",
    moment2Title: "Moment 2",
    moment2Desc: "Tailor Handover Photo",
    moment3Title: "Moment 3",
    moment3Desc: "Finished Garment Pickup",
    moment4Title: "Moment 4",
    moment4Desc: "Final Delivery Photo + 4-digit OTP",
    verificationModalTitle: "Security Photo Verification",
    stageCustomerPickup: "Pickup Verification (Customer → Delivery Agent)",
    stageTailorHandover: "Tailor Handover Verification (Delivery Agent → Tailor)",
    stageFinishedPickup: "Finished Garment Pickup Verification (Tailor → Delivery Agent)",
    stageFinalDelivery: "Final Delivery Verification (Delivery Agent → Customer)",
    packageCondition: "Package Condition",
    conditionOk: "Package OK",
    conditionDamage: "Visible Damage",
    conditionPackaging: "Packaging Issue",
    conditionOther: "Other",
    customerOtpTitle: "4-Digit Customer Delivery OTP",
    otpHelper: "Ask customer for the 4-digit OTP shown in their SILAI order timeline",
    partnerNotes: "Delivery Partner Notes (Optional)",
    confirmStageBtn: "Confirm & Complete Stage",
    submittingVerification: "Submitting Verification...",
    photoRequiredError: "Please capture or upload a verification photo.",
    otpRequiredError: "4-digit customer delivery OTP is required.",
    takePhoto: "Take Photo",
    uploadImage: "Upload Image",
    retakePhoto: "Retake Photo",
    removePhoto: "Remove Photo",
    captureFrame: "Capture Frame",
    cancelCamera: "Cancel Camera",
    photoCaptured: "Photo Captured",
    activeTripsTab: "Active Trips",
    availableAssignmentsTab: "Available Assignments",
    completedJobsTab: "Completed Deliveries",
    earningsLedgerTab: "Earnings Ledger",
    startPickup: "Start Pickup",
    callCustomer: "Call Customer",
    callTailor: "Call Tailor",
    tripsDelivered: "trips delivered"
  },
  tailor: {
    availabilityStatus: "Status",
    availableBadge: "Available",
    busyBadge: "Busy",
    closedBadge: "Closed",
    ordersQueueTab: "Orders Queue",
    menuBuilderTab: "Digital Menu Builder",
    profileTab: "Shop Profile & Onboarding",
    financialsTab: "Financials & Payouts",
    netTailorPayout: "Net Tailor Payout",
    fitProfileUsed: "Fit Profile Used",
    pickupAddress: "Pickup Address",
    acceptOrderBtn: "Accept Order",
    rejectOrderBtn: "Reject Order",
    startStitchingBtn: "Mark Stitching in Progress",
    uploadPhotoReadyBtn: "Upload Finished Photo & Mark Ready",
    noOrdersYet: "No orders received yet.",
    managePricingTitle: "Configure Garment Pricing & Turnaround",
    addServiceBtn: "+ Add Service",
    customServiceBtn: "+ Add Custom Garment Service",
    serviceName: "Service Name",
    basePrice: "Base Price",
    estimatedDays: "Est. Days",
    complexity: "Complexity",
    saveServiceBtn: "Save Service",
    deleteServiceBtn: "Delete Service",
    regularStitching: "Regular Stitching",
    designerCuts: "Designer Cuts & Patterns",
    heavyBridal: "Heavy Bridal / Hand Embroidery"
  },
  auth: {
    welcomeBack: "Welcome Back",
    joinSilai: "Join SILAI Bespoke",
    loginTab: "Log In",
    registerTab: "Sign Up",
    forgotPasswordTab: "Forgot Password",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    fullNameLabel: "Full Name",
    phoneLabel: "Phone Number",
    roleCustomer: "Customer",
    roleTailor: "Master Tailor",
    roleDelivery: "Delivery Partner",
    signInBtn: "Sign In",
    signUpBtn: "Create Account",
    sendResetBtn: "Send Reset Link",
    demoAccountsTitle: "Demo 1-Click Access",
    loginAsCustomer: "Customer Demo",
    loginAsTailor: "Tailor Demo",
    loginAsDelivery: "Delivery Demo",
    loginAsAdmin: "Admin Demo"
  },
  tracking: {
    liveRadar: "LIVE COURIER RADAR",
    reconnectingGps: "Reconnecting GPS...",
    connected: "Connected",
    leg1Title: "Leg 1: Fabric & Reference Pickup",
    leg2Title: "Leg 2: Finished Garment Doorstep Delivery",
    leg1Heading: "Courier heading to your address for fabric pickup",
    leg1PickedUp: "Fabric picked up • Courier heading to tailor atelier",
    leg2Heading: "Courier heading to tailor atelier to collect finished outfit",
    leg2PickedUp: "Outfit picked up • Out for doorstep delivery to you",
    activeRouteMap: "Active Route Map & Live Pin",
    satelliteTelemetryActive: "Satellite Telemetry Active",
    signalBuffering: "Courier device buffering signal. Showing last verified waypoint.",
    callPartner: "Call Partner",
    estimatedArrival: "Estimated Arrival",
    locationSharingActive: "Location sharing active"
  }
};

// Merged master en
const masterEn = deepMerge(currentEn, enExtensions);

// 2. Hindi Extensions
const hiExtensions = {
  booking: {
    commissionBadge: "विशेष कारीगरी सिलाई",
    masterArtisan: "प्रमाणित मास्टर कारीगर",
    fitGuarantee100: "100% सही फिट गारंटी",
    step1Title: "1. सिलाई सेवा और डिज़ाइन चुनें",
    servicesAvailable: "उपलब्ध सिलाई सेवाएं",
    days: "दिन",
    step2Title: "2. वस्त्रों की संख्या",
    quantitySubtitle: "प्रति वस्त्र मानक प्रीमियम सिलाई",
    step3Title: "3. नाप देने का तरीका चुनें",
    savedVault: "1. सहेजा हुआ नाप",
    savedVaultDesc: "प्रोफ़ाइल से नाप लें",
    manualTape: "2. खुद नाप भरें",
    manualTapeDesc: "अभी माप दर्ज करें",
    cloneOutfit: "3. पुराना वस्त्र दें",
    cloneOutfitDesc: "नमूना कपड़ा पिकअप",
    doorstepVisit: "4. घर पर नाप सेवा",
    doorstepVisitDesc: "मास्टर घर आएंगे",
    chooseFromSaved: "अपनी सहेजी गई प्रोफ़ाइल में से चुनें",
    createNewProfile: "नई नाप प्रोफ़ाइल बनाएं",
    loadingProfiles: "आपकी नाप प्रोफ़ाइल लोड हो रही है...",
    noProfilesFound: "अभी कोई सहेजी गई नाप प्रोफ़ाइल नहीं मिली।",
    enterManuallyBtn: "हाथ से नाप दर्ज करें",
    points: "बिंदु",
    recommendedFor: "के लिए अनुशंसित",
    guidedTapeTitle: "इंच टेप से नाप दर्ज करें",
    inches: "इंच",
    cm: "सेमी",
    bustChest: "सीना / बस्ट",
    waist: "कमर",
    hips: "कूल्हा",
    shoulder: "कंधा",
    armhole: "मुड्ढा",
    sleeveLength: "आस्तीन की लंबाई",
    totalLength: "पूरी लंबाई",
    neckDepth: "गले की गहराई",
    sampleGarmentNotice: "कपड़ा पिकअप के समय हमारा पार्टनर आपका सबसे अच्छा फिटिंग वस्त्र ले जाएगा। दर्जी उसी नाप से सिलाई करेगा और दोनों वस्त्र वापस करेगा।",
    doorstepVisitNotice: "प्रमाणित मास्टर दर्जी आपके घर आकर शरीर का सटीक और संपूर्ण नाप लेंगे।",
    step4Title: "4. डिज़ाइन संदर्भ और पसंद",
    originalReference: "मूल संदर्भ",
    referencePhotoLabel: "डिज़ाइन फोटो का लिंक / प्रेरणा",
    referencePhotoPlaceholder: "https://... डिज़ाइन फोटो का लिंक पेस्ट करें",
    referencePhotoNotice: "* मूल संदर्भ फोटो दर्जी के पास सुरक्षित रहेगा और सिलाई इसी के अनुसार होगी।",
    necklinePref: "गले का डिज़ाइन",
    sleevePref: "आस्तीन का प्रकार",
    silhouetteFit: "फिटिंग का प्रकार",
    step5Title: "5. दर्जी के लिए विशेष निर्देश",
    notesPlaceholder: "उदा. अस्तर लगाना, 1.5 इंच अतिरिक्त मार्जिन, डोरी और लटकन...",
    step6Title: "6. संपर्क और डिलीवरी पता",
    customerFullName: "ग्राहक का पूरा नाम",
    phoneForOtp: "फोन नंबर (डिलीवरी ओटीपी हेतु)",
    pickupAddressLabel: "कपड़ा पिकअप का पता",
    selectOnMap: "नक्शे पर पता चुनें",
    bangaloreAreaVerified: "✓ बेंगलुरु सेवा क्षेत्र",
    sameAddressCheckbox: "डिलीवरी का पता पिकअप पते के समान है",
    returnDeliveryAddressLabel: "तैयार वस्त्र डिलीवरी का पता",
    step7Title: "7. कूपन कोड / छूट वाउचर",
    savedBadge: "बचत",
    applyCouponTitle: "कूपन कोड लागू करें",
    applyCouponSubtitle: "उपलब्ध छूट वाउचर देखें",
    applyBtn: "लागू करें",
    couponAppliedSuccess: "लागू हो गया ✓",
    couponSavingNotice: "इस कूपन से आपकी बचत हो रही है।",
    changeCoupon: "बदलें",
    removeCoupon: "हटाएं",
    priceSummaryTitle: "पारदर्शी सिलाई मूल्य विवरण",
    basePriceLabel: "सिलाई शुल्क",
    pickupDeliveryFee: "घर से पिकअप और डिलीवरी",
    privilegePromo: "कूपन छूट",
    estimatedGst: "जीएसटी (5%)",
    finalPayable: "कुल देय राशि",
    reviewOrderBtn: "ऑर्डर की समीक्षा करें",
    reviewTitle: "ऑर्डर समीक्षा और पुष्टि",
    reviewSubtitle: "अंतिम पुष्टि से पहले अपने सिलाई विवरण जांच लें।",
    masterAtelier: "मास्टर दर्जी / बुटीक",
    garmentCraftsmanship: "वस्त्र और कारीगरी",
    service: "सेवा",
    quantity: "संख्या",
    complexity: "कारीगरी",
    estStitching: "सिलाई समय",
    fitSpecification: "नाप का तरीका",
    method: "पद्धति",
    designStylingGuide: "डिज़ाइन और स्टाइल गाइड",
    neckline: "गला",
    sleeve: "आस्तीन",
    fit: "फिटिंग",
    attachedReference: "संलग्न डिज़ाइन फोटो",
    customerLogistics: "ग्राहक संपर्क और लॉजिस्टिक्स",
    pickupLocation: "पिकअप स्थान",
    returnDelivery: "डिलीवरी स्थान",
    priceBreakdown: "पारदर्शी मूल्य विवरण",
    stitchingSubtotal: "सिलाई योग",
    backToEdit: "बदलाव के लिए वापस जाएं",
    placeOrderCod: "ऑर्डर करें (कैश ऑन डिलीवरी)",
    proceedToPay: "भुगतान करें",
    creatingOrder: "ऑर्डर तैयार किया जा रहा है...",
    confirmationVerified: "पुष्टि सत्यापित",
    orderSuccessTitle: "ऑर्डर सफलतापूर्वक दर्ज हुआ",
    orderSuccessSubtitle: "आपका कस्टम सिलाई ऑर्डर लेजर में दर्ज कर लिया गया है।",
    orderNumberLabel: "ऑर्डर संख्या",
    paymentLabel: "भुगतान",
    initialStatus: "प्रारंभिक स्थिति",
    amountPaidRazorpay: "भुगतान पूर्ण (रेज़रपे सत्यापित)",
    trackOrderBtn: "ऑर्डर ट्रैक करें",
    doneBtn: "पूर्ण"
  },
  address: {
    modalTitle: "डिलीवरी पता और जीपीएस स्थिति",
    modalSubtitle: "बेंगलुरु मेट्रो सेवा क्षेत्र (रीयल-टाइम जीपीएस)",
    savedAddressesTab: "सहेजे गए पते",
    enterAddressTab: "पता दर्ज करें",
    locateOnMapTab: "नक्शे पर खोजें",
    selectDeliveryLocation: "डिलीवरी स्थान चुनें",
    addNew: "नया जोड़ें",
    defaultBadge: "डिफ़ॉल्ट",
    coordinates: "निर्देशांक",
    saveAddressAs: "पता इस नाम से सहेजें",
    home: "घर",
    work: "कार्यालय",
    other: "अन्य",
    flatHouseNumber: "फ्लैट, मकान नं., बिल्डिंग, अपार्टमेंट *",
    flatHousePlaceholder: "उदा. फ्लैट 302, प्रेस्टीज स्प्रिंग्स",
    streetRoad: "सड़क, लेन या मार्ग",
    streetRoadPlaceholder: "उदा. 100 फीट रोड, चौथी क्रॉस",
    areaLocality: "क्षेत्र, मोहल्ला *",
    areaLocalityPlaceholder: "उदा. इंदिरानगर / कोरमंगला",
    postalPincode: "पिनकोड *",
    postalPincodePlaceholder: "उदा. 560038",
    city: "शहर",
    state: "राज्य",
    landmark: "नजदीकी पहचान (वैकल्पिक)",
    landmarkPlaceholder: "उदा. सोनी सेंटर के सामने / मेट्रो स्टेशन के पास",
    pinPreview: "सटीक पिन पूर्वावलोकन",
    clickToFineTune: "पिन बदलने के लिए नक्शे पर क्लिक करें",
    setAsDefault: "इसे मेरा प्राथमिक डिलीवरी पता बनाएं",
    confirmUseThis: "पुष्टि करें और इस पते का उपयोग करें",
    savingAddress: "पता सहेजा जा रहा है...",
    mapHint: "पिन को अपने दरवाजे पर रखें या जीपीएस का उपयोग करें।",
    detectedLocation: "पहचाना गया स्थान",
    confirmPinAddDetails: "पिन की पुष्टि करें और विवरण जोड़ें",
    validationError: "कृपया मकान नंबर और क्षेत्र का नाम दर्ज करें।",
    saveError: "पता सहेजने में विफल।",
    networkError: "नेटवर्क त्रुटि हुई।"
  },
  delivery: {
    fleetDutyOnline: "ड्यूटी स्थिति: ऑनलाइन",
    fleetDutyOffline: "ड्यूटी स्थिति: ऑफलाइन",
    gpsTelemetryLive: "जीपीएस टेलीमेट्री सक्रिय (15s)",
    gpsStandby: "जीपीएस स्टैंडबाय",
    fourMomentSecurity: "अनिवार्य 4-चरण फोटो सुरक्षा जांच",
    disputeProofGuarantee: "विवाद-मुक्त गारंटी",
    moment1Title: "चरण 1",
    moment1Desc: "ग्राहक पिकअप + पैकेट की स्थिति",
    moment2Title: "चरण 2",
    moment2Desc: "दर्जी को सुपुर्दगी फोटो",
    moment3Title: "चरण 3",
    moment3Desc: "तैयार पोशाक पिकअप फोटो",
    moment4Title: "चरण 4",
    moment4Desc: "अंतिम डिलीवरी फोटो + 4-अंकीय ओटीपी",
    verificationModalTitle: "सुरक्षा फोटो सत्यापन",
    stageCustomerPickup: "पिकअप सत्यापन (ग्राहक → डिलीवरी एजेंट)",
    stageTailorHandover: "दर्जी को सुपुर्दगी (डिलीवरी एजेंट → दर्जी)",
    stageFinishedPickup: "तैयार पोशाक पिकअप (दर्जी → डिलीवरी एजेंट)",
    stageFinalDelivery: "अंतिम डिलीवरी (डिलीवरी एजेंट → ग्राहक)",
    packageCondition: "पैकेट की स्थिति",
    conditionOk: "पैकेट सही है",
    conditionDamage: "स्पष्ट क्षति",
    conditionPackaging: "पैकिंग समस्या",
    conditionOther: "अन्य",
    customerOtpTitle: "4-अंकीय ग्राहक डिलीवरी ओटीपी",
    otpHelper: "ग्राहक से उनकी SILAI स्क्रीन पर दिख रहा 4-अंकीय कोड पूछें",
    partnerNotes: "डिलीवरी पार्टनर नोट्स (वैकल्पिक)",
    confirmStageBtn: "पुष्टि करें और चरण पूरा करें",
    submittingVerification: "सत्यापन भेजा जा रहा है...",
    photoRequiredError: "कृपया सत्यापन फोटो लें या अपलोड करें।",
    otpRequiredError: "4-अंकीय ग्राहक डिलीवरी ओटीपी अनिवार्य है।",
    takePhoto: "फोटो लें",
    uploadImage: "फोटो अपलोड करें",
    retakePhoto: "दोबारा फोटो लें",
    removePhoto: "फोटो हटाएं",
    captureFrame: "फोटो कैप्चर करें",
    cancelCamera: "कैमरा बंद करें",
    photoCaptured: "फोटो ले ली गई",
    activeTripsTab: "सक्रिय ट्रिप्स",
    availableAssignmentsTab: "उपलब्ध असाइनमेंट्स",
    completedJobsTab: "पूर्ण डिलीवरी",
    earningsLedgerTab: "कमाई खाता",
    startPickup: "पिकअप शुरू करें",
    callCustomer: "ग्राहक को कॉल करें",
    callTailor: "दर्जी को कॉल करें",
    tripsDelivered: "ट्रिप्स पूर्ण"
  },
  tailor: {
    availabilityStatus: "स्थिति",
    availableBadge: "उपलब्ध",
    busyBadge: "व्यस्त",
    closedBadge: "बंद",
    ordersQueueTab: "ऑर्डर कतार",
    menuBuilderTab: "डिजिटल मेनू बिल्डर",
    profileTab: "दुकान प्रोफ़ाइल व सेटअप",
    financialsTab: "वित्तीय व भुगतान विवरण",
    netTailorPayout: "शुद्ध दर्जी भुगतान",
    fitProfileUsed: "प्रयुक्त नाप प्रोफ़ाइल",
    pickupAddress: "पिकअप पता",
    acceptOrderBtn: "ऑर्डर स्वीकार करें",
    rejectOrderBtn: "ऑर्डर अस्वीकार करें",
    startStitchingBtn: "सिलाई प्रगति पर चिह्नित करें",
    uploadPhotoReadyBtn: "तैयार फोटो अपलोड करें और रेडी करें",
    noOrdersYet: "अभी तक कोई ऑर्डर प्राप्त नहीं हुआ।",
    managePricingTitle: "सिलाई मूल्य और समय निर्धारित करें",
    addServiceBtn: "+ सेवा जोड़ें",
    customServiceBtn: "+ कस्टम सेवा जोड़ें",
    serviceName: "सेवा का नाम",
    basePrice: "सिलाई शुल्क",
    estimatedDays: "अनुमानित दिन",
    complexity: "जटिलता",
    saveServiceBtn: "सेवा सहेजें",
    deleteServiceBtn: "सेवा हटाएं",
    regularStitching: "साधारण सिलाई",
    designerCuts: "डिज़ाइनर कट्स और पैटर्न",
    heavyBridal: "भारी ब्राइडल / हाथ की कढ़ाई"
  },
  auth: {
    welcomeBack: "वापसी पर स्वागत है",
    joinSilai: "SILAI से जुड़ें",
    loginTab: "लॉग इन",
    registerTab: "साइन अप",
    forgotPasswordTab: "पासवर्ड भूल गए",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    fullNameLabel: "पूरा नाम",
    phoneLabel: "फोन नंबर",
    roleCustomer: "ग्राहक",
    roleTailor: "मास्टर दर्जी",
    roleDelivery: "डिलीवरी पार्टनर",
    signInBtn: "लॉग इन करें",
    signUpBtn: "खाता बनाएं",
    sendResetBtn: "रीसेट लिंक भेजें",
    demoAccountsTitle: "1-क्लिक डेमो लॉगिन",
    loginAsCustomer: "ग्राहक डेमो",
    loginAsTailor: "दर्जी डेमो",
    loginAsDelivery: "डिलीवरी डेमो",
    loginAsAdmin: "एडमिन डेमो"
  },
  tracking: {
    liveRadar: "लाइव कूरियर रडार",
    reconnectingGps: "जीपीएस पुनः कनेक्ट हो रहा है...",
    connected: "कनेक्टेड",
    leg1Title: "चरण 1: कपड़ा और नाप पिकअप",
    leg2Title: "चरण 2: तैयार वस्त्र की डिलीवरी",
    leg1Heading: "कूरियर कपड़ा लेने आपके पते पर आ रहा है",
    leg1PickedUp: "कपड़ा उठाया गया • कूरियर दर्जी के बुटीक की ओर जा रहा है",
    leg2Heading: "कूरियर तैयार वस्त्र लेने दर्जी के बुटीक की ओर जा रहा है",
    leg2PickedUp: "पोशाक उठाई गई • आपके घर डिलीवरी के लिए निकल चुकी है",
    activeRouteMap: "सक्रिय मार्ग और लाइव पिन",
    satelliteTelemetryActive: "सैटेलाइट टेलीमेट्री सक्रिय",
    signalBuffering: "सिग्नल बफर हो रहा है। अंतिम सत्यापित स्थान दिखाया जा रहा है।",
    callPartner: "पार्टनर को कॉल करें",
    estimatedArrival: "अनुमानित आगमन",
    locationSharingActive: "स्थान साझाकरण सक्रिय"
  }
};

const masterHi = deepMerge(currentHi, hiExtensions);

// Map of all 12 languages with native names
const ALL_LANGUAGES = [
  { code: 'en', name: 'English', dict: masterEn },
  { code: 'hi', name: 'Hindi', dict: masterHi },
  { code: 'bn', name: 'Bengali', legacy: bnLegacy },
  { code: 'ta', name: 'Tamil', legacy: taLegacy },
  { code: 'te', name: 'Telugu', legacy: teLegacy },
  { code: 'kn', name: 'Kannada', legacy: knLegacy },
  { code: 'mr', name: 'Marathi', legacy: mrLegacy },
  { code: 'gu', name: 'Gujarati', legacy: guLegacy },
  { code: 'ml', name: 'Malayalam', legacy: mlLegacy },
  { code: 'pa', name: 'Punjabi', legacy: paLegacy },
  { code: 'or', name: 'Odia', legacy: orLegacy },
  { code: 'as', name: 'Assamese', legacy: asLegacy },
];

// Helper to fill missing keys from base while preserving native overrides
function buildFullLanguageDict(base, override) {
  function mergeWithBase(b, o) {
    const res = {};
    for (const k of Object.keys(b)) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) {
        res[k] = mergeWithBase(b[k], (o && typeof o === 'object') ? o[k] || {} : {});
      } else {
        if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') {
          res[k] = o[k];
        } else {
          res[k] = b[k];
        }
      }
    }
    return res;
  }
  return mergeWithBase(base, override || {});
}

// Write out all files and verify
const finalDicts = {};

for (const lang of ALL_LANGUAGES) {
  let dict;
  if (lang.code === 'en') {
    dict = masterEn;
  } else if (lang.code === 'hi') {
    dict = masterHi;
  } else {
    // Read the current file on disk if exists, merge with legacy, then merge with masterEn
    let onDisk = {};
    const diskPath = path.join(targetDir, `${lang.code}.json`);
    if (fs.existsSync(diskPath)) {
      try {
        onDisk = JSON.parse(fs.readFileSync(diskPath, 'utf8'));
      } catch (e) {}
    }
    const combinedOverrides = deepMerge(lang.legacy || {}, onDisk);
    dict = buildFullLanguageDict(masterEn, combinedOverrides);
  }

  finalDicts[lang.code] = dict;
  const filePath = path.join(targetDir, `${lang.code}.json`);
  fs.writeFileSync(filePath, JSON.stringify(dict, null, 2), 'utf8');
}

// Parity Check
function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? prefix + '.' + k : k;
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      keys = keys.concat(flattenKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const masterKeys = flattenKeys(masterEn);
console.log('Master en keys count:', masterKeys.length);

let allValid = true;
for (const lang of ALL_LANGUAGES) {
  const currentKeys = flattenKeys(finalDicts[lang.code]);
  const missing = masterKeys.filter(k => !currentKeys.includes(k));
  if (missing.length > 0) {
    console.error(`ERROR: ${lang.code} is missing ${missing.length} keys!`, missing.slice(0, 5));
    allValid = false;
  } else {
    console.log(`✓ ${lang.code} (${lang.name}): 100% key parity (${currentKeys.length} keys)`);
  }
}

if (allValid) {
  console.log('\nSUCCESS: All 12 language dictionaries generated with 100% key parity!');
} else {
  process.exit(1);
}
