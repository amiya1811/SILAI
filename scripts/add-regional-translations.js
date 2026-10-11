const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'translations');

// Regional translations dictionary
const regional = {
  bn: {
    booking: {
      commissionBadge: "কাস্টম কারিগরি সেলাই",
      masterArtisan: "প্রত্যয়িত মাস্টার কারিগর",
      fitGuarantee100: "১০০% সঠিক ফিট নিশ্চয়তা",
      step1Title: "১. সেলাই পরিষেবা ও প্রকার নির্বাচন করুন",
      servicesAvailable: "উপলব্ধ সেলাই পরিষেবা",
      days: "দিন",
      step2Title: "২. পোশাকের সংখ্যা",
      quantitySubtitle: "প্রতি পোশাকে মানসম্পন্ন প্রিমিয়াম সেলাই",
      step3Title: "৩. মাপ নেওয়ার পদ্ধতি নির্বাচন করুন",
      savedVault: "১. সংরক্ষিত মাপ",
      savedVaultDesc: "প্রোফাইল থেকে মাপ নিন",
      manualTape: "২. নিজে মাপ দিন",
      manualTapeDesc: "এখনই মাপ লিখুন",
      cloneOutfit: "৩. নমুনা পোশাক দিন",
      cloneOutfitDesc: "নমুনা পোশাক পিকআপ",
      doorstepVisit: "৪. ঘরে বসে মাপ সেবা",
      doorstepVisitDesc: "মাস্টার বাড়ি আসবেন",
      chooseFromSaved: "আপনার সংরক্ষিত প্রোফাইল থেকে বাছুন",
      createNewProfile: "নতুন মাপের প্রোফাইল তৈরি করুন",
      loadingProfiles: "সংরক্ষিত প্রোফাইল লোড হচ্ছে...",
      noProfilesFound: "কোনো সংরক্ষিত প্রোফাইল পাওয়া যায়নি।",
      enterManuallyBtn: "ম্যানুয়াল মাপ দিন",
      guidedTapeTitle: "ফিতা দিয়ে মাপ নিন",
      bustChest: "বক্ষ / ছাতি",
      waist: "কোমর",
      hips: "নিতম্ব",
      shoulder: "কাঁধ",
      armhole: "মুহুরি",
      sleeveLength: "হাতার দৈর্ঘ্য",
      totalLength: "সম্পূর্ণ দৈর্ঘ্য",
      neckDepth: "গলার গভীরতা",
      step4Title: "৪. ডিজাইন রেফারেন্স ও পছন্দ",
      step5Title: "৫. দর্জির জন্য বিশেষ নির্দেশ",
      step6Title: "৬. যোগাযোগ ও ডেলিভারি ঠিকানা",
      step7Title: "৭. কুপন কোড / ডিসকাউন্ট",
      reviewTitle: "অর্ডার পর্যালোচনা ও নিশ্চিতকরণ",
      orderSuccessTitle: "অর্ডার সফলভাবে গৃহীত হয়েছে",
      trackOrderBtn: "অর্ডার ট্র্যাক করুন",
      doneBtn: "সম্পন্ন"
    },
    address: {
      modalTitle: "ডেলিভারি ঠিকানা ও জিপিএস অবস্থান",
      modalSubtitle: "বেঙ্গালুরু মেট্রো পরিষেবা এলাকা (রিয়েল-টাইম জিপিএস)",
      savedAddressesTab: "সংরক্ষিত ঠিকানাসমূহ",
      enterAddressTab: "ঠিকানা লিখুন",
      locateOnMapTab: "মানচিত্রে খুঁজুন",
      selectDeliveryLocation: "ডেলিভারির স্থান নির্বাচন করুন",
      addNew: "নতুন যোগ করুন",
      home: "বাড়ি",
      work: "অফিস",
      other: "অন্যান্য",
      confirmUseThis: "নিশ্চিত করুন ও এই ঠিকানা ব্যবহার করুন"
    },
    delivery: {
      fleetDutyOnline: "ডিউটি: অনলাইন",
      fleetDutyOffline: "ডিউটি: অফলাইন",
      activeTripsTab: "সক্রিয় ট্রিপ",
      availableAssignmentsTab: "উপলব্ধ দায়িত্ব",
      completedJobsTab: "সম্পন্ন ডেলিভারি",
      earningsLedgerTab: "উপার্জন খতিয়ান"
    },
    tailor: {
      availableBadge: "উপলব্ধ",
      busyBadge: "ব্যস্ত",
      closedBadge: "বন্ধ",
      ordersQueueTab: "অর্ডার সারি",
      menuBuilderTab: "ডিজিটাল মেনু বিল্ডার",
      profileTab: "দোকানের প্রোফাইল",
      financialsTab: "আর্থিক ও পেমেন্ট"
    },
    auth: {
      welcomeBack: "স্বাগতম",
      joinSilai: "SILAI-তে যোগ দিন",
      loginTab: "লগ ইন",
      registerTab: "সাইন আপ",
      forgotPasswordTab: "পাসওয়ার্ড ভুলে গেছেন"
    }
  },
  ta: {
    booking: {
      commissionBadge: "தனிப்பயன் தையல் கலை",
      masterArtisan: "சான்றளிக்கப்பட்ட மாஸ்டர் தையல்காரர்",
      fitGuarantee100: "100% ஃபிட் உத்தரவாதம்",
      step1Title: "1. தையல் சேவை மற்றும் வகையைத் தேர்வுசெய்க",
      servicesAvailable: "கிடைக்கும் சேவைகள்",
      days: "நாட்கள்",
      step2Title: "2. ஆடைகளின் எண்ணிக்கை",
      quantitySubtitle: "ஒவ்வொரு ஆடைக்கும் தனிப்பயன் தையல்",
      step3Title: "3. அளவு எடுக்கும் முறையைத் தேர்ந்தெடுக்கவும்",
      savedVault: "1. சேமிக்கப்பட்ட அளவுகள்",
      savedVaultDesc: "சுயவிவரத்தைப் பயன்படுத்துக",
      manualTape: "2. நேரடி அளவு நுழைவு",
      manualTapeDesc: "அளவுகளை இப்போதே உள்ளிடுக",
      cloneOutfit: "3. மாதிரி ஆடை வழங்குக",
      cloneOutfitDesc: "மாதிரி ஆடை பிக்கப்",
      doorstepVisit: "4. வீட்டிற்கே வரும் அளவு சேவை",
      doorstepVisitDesc: "மாஸ்டர் வீட்டிற்கு வருவார்",
      chooseFromSaved: "சேமிக்கப்பட்ட சுயவிவரங்களிலிருந்து தேர்வுசெய்க",
      createNewProfile: "புதிய அளவு சுயவிவரத்தை உருவாக்குக",
      guidedTapeTitle: "வழிகாட்டப்பட்ட டேப் அளவீடுகள்",
      bustChest: "மார்பளவு",
      waist: "இடுப்பளவு",
      hips: "இடுப்பு கீழ் பகுதி",
      shoulder: "தோள்பட்டை",
      step4Title: "4. வடிவமைப்பு மற்றும் விருப்பங்கள்",
      step5Title: "5. தையல் குறிப்புகள்",
      step6Title: "6. தொடர்பு மற்றும் டெலிவரி முகவரி",
      step7Title: "7. தள்ளுபடி கூப்பன்",
      reviewTitle: "ஆர்டர் சரிபார்ப்பு மற்றும் உறுதிப்படுத்தல்",
      orderSuccessTitle: "ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது",
      trackOrderBtn: "ஆர்டரைக் கண்காணிக்கவும்",
      doneBtn: "முடிந்தது"
    },
    address: {
      modalTitle: "டெலிவரி முகவரி மற்றும் ஜிபிஎஸ் இருப்பிடம்",
      modalSubtitle: "பெங்களூரு மெட்ரோ சேவை பகுதி",
      savedAddressesTab: "சேமிக்கப்பட்ட முகவரிகள்",
      enterAddressTab: "முகவரியை உள்ளிடுக",
      locateOnMapTab: "வரைபடத்தில் கண்டறிக",
      home: "வீடு",
      work: "பணி அலுவலகம்",
      other: "மற்றவை",
      confirmUseThis: "உறுதிசெய்து இந்த முகவரியைப் பயன்படுத்துக"
    },
    delivery: {
      fleetDutyOnline: "பணி நிலை: ஆன்லைன்",
      fleetDutyOffline: "பணி நிலை: ஆஃப்லைன்",
      activeTripsTab: "செயலில் உள்ள பயணங்கள்",
      availableAssignmentsTab: "கிடைக்கும் பணிகள்",
      completedJobsTab: "முடிக்கப்பட்டவை",
      earningsLedgerTab: "வருமான கணக்கு"
    },
    tailor: {
      availableBadge: "கிடைக்கிறார்",
      busyBadge: "வேலைப்பளு",
      closedBadge: "மூடப்பட்டது",
      ordersQueueTab: "ஆர்டர் வரிசை",
      menuBuilderTab: "டிஜிட்டல் மெனு",
      profileTab: "கடை சுயவிவரம்",
      financialsTab: "வருமானம் மற்றும் கொடுப்பனவுகள்"
    },
    auth: {
      welcomeBack: "மீண்டும் வருக",
      joinSilai: "SILAI இல் இணைக",
      loginTab: "உள்நுழைக",
      registerTab: "பதிவு செய்க",
      forgotPasswordTab: "கடவுச்சொல் மறந்துவிட்டதா"
    }
  },
  te: {
    booking: {
      commissionBadge: "ప్రత్యేక టైలరింగ్ ఆర్డర్",
      masterArtisan: "సర్టిఫైడ్ మాస్టర్ టైలర్",
      fitGuarantee100: "100% సరైన ఫిట్ హామీ",
      step1Title: "1. కుట్టు సేవ & రకాన్ని ఎంచుకోండి",
      servicesAvailable: "అందుబాటులో ఉన్న సేవలు",
      days: "రోజులు",
      step2Title: "2. దుస్తుల సంఖ్య",
      quantitySubtitle: "ప్రతి వస్త్రానికి నాణ్యమైన కుట్టు",
      step3Title: "3. కొలత పద్ధతిని ఎంచుకోండి",
      savedVault: "1. భద్రపరచిన కొలతలు",
      savedVaultDesc: "ప్రొఫైల్ ఉపయోగించండి",
      manualTape: "2. మాన్యువల్ కొలతలు",
      manualTapeDesc: "కొలతలను నమోదు చేయండి",
      cloneOutfit: "3. నమూనా దుస్తులు ఇవ్వండి",
      cloneOutfitDesc: "నమూనా దుస్తుల పికప్",
      doorstepVisit: "4. ఇంటి వద్దకే కొలత సేవ",
      doorstepVisitDesc: "మాస్టర్ ఇంటికి వస్తారు",
      chooseFromSaved: "భద్రపరచిన ప్రొఫైల్స్ నుండి ఎంచుకోండి",
      createNewProfile: "కొత్త ఫిట్ ప్రొఫైల్ సృష్టించండి",
      guidedTapeTitle: "టేప్ కొలతలు",
      bustChest: "ఛాతీ కొలత",
      waist: "నడుము",
      hips: "హిప్స్",
      shoulder: "భుజం",
      step4Title: "4. డిజైన్ మరియు శైలి ఎంపికలు",
      step5Title: "5. ప్రత్యేక సూచనలు",
      step6Title: "6. సంప్రదింపు & డెలివరీ చిరునామా",
      step7Title: "7. కూపన్ కోడ్",
      reviewTitle: "ఆర్డర్ సమీక్ష & నిర్ధారణ",
      orderSuccessTitle: "ఆర్డర్ విజయవంతంగా నమోదైంది",
      trackOrderBtn: "ఆర్డర్ ట్రాక్ చేయండి",
      doneBtn: "పూర్తయింది"
    },
    address: {
      modalTitle: "డెలివరీ చిరునామా & జీపీఎస్ లొకేషన్",
      modalSubtitle: "బెంగళూరు మెట్రో సర్వీస్ ఏరియా",
      savedAddressesTab: "సేవ్ చేసిన చిరునామాలు",
      enterAddressTab: "చిరునామా నమోదు చేయండి",
      locateOnMapTab: "మ్యాప్‌లో గుర్తించండి",
      home: "ఇల్లు",
      work: "ఆఫీస్",
      other: "ఇతర",
      confirmUseThis: "నిర్ధారించి ఈ చిరునామాను ఉపయోగించండి"
    },
    delivery: {
      fleetDutyOnline: "డ్యూటీ: ఆన్‌లైన్",
      fleetDutyOffline: "డ్యూటీ: ఆఫ్‌లైన్",
      activeTripsTab: "యాక్టివ్ ట్రిప్పులు",
      availableAssignmentsTab: "అందుబాటులో ఉన్న పనులు",
      completedJobsTab: "పూర్తయిన డెలివరీలు",
      earningsLedgerTab: "ఆదాయాలు"
    },
    tailor: {
      availableBadge: "అందుబాటులో ఉన్నారు",
      busyBadge: "బిజీగా ఉన్నారు",
      closedBadge: "మూసివేయబడింది",
      ordersQueueTab: "ఆర్డర్ల క్యూ",
      menuBuilderTab: "డిజిటల్ మెనూ",
      profileTab: "షాప్ ప్రొఫైల్",
      financialsTab: "ఆదాయాలు & చెల్లింపులు"
    },
    auth: {
      welcomeBack: "స్వాగతం",
      joinSilai: "SILAI లో చేరండి",
      loginTab: "లాగిన్",
      registerTab: "సైన్ అప్",
      forgotPasswordTab: "పాస్‌వర్డ్ మర్చిపోయారా"
    }
  },
  kn: {
    booking: {
      commissionBadge: "ವಿಶೇಷ ಕಸ್ಟಮ್ ಹೊಲಿಗೆ",
      masterArtisan: "ಪ್ರಮಾಣೀಕೃತ ಮಾಸ್ಟರ್ ಟೈಲರ್",
      fitGuarantee100: "100% ನಿಖರ ಫಿಟ್ ಭರವಸೆ",
      step1Title: "1. ಹೊಲಿಗೆ ಸೇವೆ ಮತ್ತು ವಿನ್ಯಾಸ ಆಯ್ಕೆಮಾಡಿ",
      servicesAvailable: "ಲಭ್ಯವಿರುವ ಸೇವೆಗಳು",
      days: "ದಿನಗಳು",
      step2Title: "2. ಉಡುಪುಗಳ ಸಂಖ್ಯೆ",
      quantitySubtitle: "ಪ್ರತಿ ಉಡುಪಿಗೆ ಗುಣಮಟ್ಟದ ಹೊಲಿಗೆ",
      step3Title: "3. ಅಳತೆಯ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      savedVault: "1. ಉಳಿಸಿದ ಅಳತೆಗಳು",
      savedVaultDesc: "ಪ್ರೊಫೈಲ್ ಬಳಸಿ",
      manualTape: "2. ನೇರ ಅಳತೆ ನಮೂದಿಸಿ",
      manualTapeDesc: "ಅಳತೆಗಳನ್ನು ಈಗಲೇ ನಮೂದಿಸಿ",
      cloneOutfit: "3. ಮಾದರಿ ಉಡುಪು ನೀಡಿ",
      cloneOutfitDesc: "ಮಾದರಿ ಉಡುಪು ಪಿಕಪ್",
      doorstepVisit: "4. ಮನೆ ಬಾಗಿಲಿಗೆ ಅಳತೆ ಸೇವೆ",
      doorstepVisitDesc: "ಮಾಸ್ಟರ್ ಮನೆಗೆ ಬರುತ್ತಾರೆ",
      chooseFromSaved: "ಉಳಿಸಿದ ಪ್ರೊಫೈಲ್‌ಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ",
      createNewProfile: "ಹೊಸ ಫಿಟ್ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ",
      guidedTapeTitle: "ಟೇಪ್ ಅಳತೆಗಳು",
      bustChest: "ಎದೆಯಳತೆ",
      waist: "ಸೊಂಟ",
      hips: "ಸೊಂಟದ ಕೆಳಭಾಗ",
      shoulder: "ಹೆಗಲು",
      step4Title: "4. ವಿನ್ಯಾಸ ಮತ್ತು ಶೈಲಿಯ ಆದ್ಯತೆಗಳು",
      step5Title: "5. ವಿಶೇಷ ಹೊಲಿಗೆ ಸೂಚನೆಗಳು",
      step6Title: "6. ಸಂಪರ್ಕ ಮತ್ತು ಡೆಲಿವರಿ ವಿಳಾಸ",
      step7Title: "7. ರಿಯಾಯಿತಿ ಕೂಪನ್",
      reviewTitle: "ಆರ್ಡರ್ ಪರಿಶೀಲನೆ ಮತ್ತು ದೃಢೀಕರಣ",
      orderSuccessTitle: "ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ",
      trackOrderBtn: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
      doneBtn: "ಮುಗಿಯಿತು"
    },
    address: {
      modalTitle: "ಡೆಲಿವರಿ ವಿಳಾಸ ಮತ್ತು ಜಿಪಿಎಸ್ ಸ್ಥಳ",
      modalSubtitle: "ಬೆಂಗಳೂರು ಮೆಟ್ರೋ ಸೇವಾ ಪ್ರದೇಶ",
      savedAddressesTab: "ಉಳಿಸಿದ ವಿಳಾಸಗಳು",
      enterAddressTab: "ವಿಳಾಸ ನಮೂದಿಸಿ",
      locateOnMapTab: "ನಕ್ಷೆಯಲ್ಲಿ ಗುರುತಿಸಿ",
      home: "ಮನೆ",
      work: "ಕಚೇರಿ",
      other: "ಇತರೆ",
      confirmUseThis: "ದೃಢೀಕರಿಸಿ ಈ ವಿಳಾಸವನ್ನು ಬಳಸಿ"
    },
    delivery: {
      fleetDutyOnline: "ಡ್ಯೂಟಿ: ಆನ್‌ಲೈನ್",
      fleetDutyOffline: "ಡ್ಯೂಟಿ: ಆಫ್‌ಲೈನ್",
      activeTripsTab: "ಸಕ್ರಿಯ ಟ್ರಿಪ್‌ಗಳು",
      availableAssignmentsTab: "ಲಭ್ಯವಿರುವ ಕೆಲಸಗಳು",
      completedJobsTab: "ಪೂರ್ಣಗೊಂಡ ಡೆಲಿವರಿಗಳು",
      earningsLedgerTab: "ಗಳಿಕೆ ಖಾತೆ"
    },
    tailor: {
      availableBadge: "ಲಭ್ಯವಿದೆ",
      busyBadge: "ಕಾರ್ಯನಿರತ",
      closedBadge: "ಮುಚ್ಚಲಾಗಿದೆ",
      ordersQueueTab: "ಆರ್ಡರ್ ಕ್ಯೂ",
      menuBuilderTab: "ಡಿಜಿಟಲ್ ಮೆನು",
      profileTab: "ಅಂಗಡಿ ಪ್ರೊಫೈಲ್",
      financialsTab: "ಗಳಿಕೆ ಮತ್ತು ಪಾವತಿಗಳು"
    },
    auth: {
      welcomeBack: "ಮತ್ತೆ ಸುಸ್ವಾಗತ",
      joinSilai: "SILAI ಗೆ ಸೇರಿ",
      loginTab: "ಲಾಗಿನ್",
      registerTab: "ಸೈನ್ ಅಪ್",
      forgotPasswordTab: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ"
    }
  },
  mr: {
    booking: {
      commissionBadge: "कस्टम कारागिरी शिलाई",
      masterArtisan: "प्रमाणित मास्टर शिंपी",
      fitGuarantee100: "१००% परफेक्ट फिट हमी",
      step1Title: "१. शिलाई सेवा आणि प्रकार निवडा",
      servicesAvailable: "उपलब्ध सेवा",
      days: "दिवस",
      step2Title: "२. कपड्यांची संख्या",
      quantitySubtitle: "प्रत्येक कपड्यासाठी दर्जेदार शिलाई",
      step3Title: "३. मापाची पद्धत निवडा",
      savedVault: "१. सेव्ह केलेले माप",
      savedVaultDesc: "प्रोफाइल वापरा",
      manualTape: "२. स्वतः माप टाका",
      manualTapeDesc: "मापे आताच भरा",
      cloneOutfit: "३. नमुना कपडा द्या",
      cloneOutfitDesc: "नमुना कपडा पिकअप",
      doorstepVisit: "४. घरी माप सेवा",
      doorstepVisitDesc: "मास्टर घरी येतील",
      chooseFromSaved: "सेव्ह केलेल्या प्रोफाइलमधून निवडा",
      createNewProfile: "नवीन फिट प्रोफाइल तयार करा",
      guidedTapeTitle: "टेप मापे",
      bustChest: "छातीचे माप",
      waist: "कंबर",
      hips: "कमरेचा खालचा भाग",
      shoulder: "खांदा",
      step4Title: "४. डिझाईन आणि स्टाईल पसंती",
      step5Title: "५. शिलाईच्या विशेष सूचना",
      step6Title: "६. संपर्क आणि डिलिव्हरी पत्ता",
      step7Title: "७. कूपन कोड / सवलत",
      reviewTitle: "ऑर्डर पुनरावलोकन आणि पुष्टी",
      orderSuccessTitle: "ऑर्डर यशस्वीरीत्या नोंदवली गेली",
      trackOrderBtn: "ऑर्डर ट्रॅक करा",
      doneBtn: "पूर्ण"
    },
    address: {
      modalTitle: "डिलिव्हरी पत्ता आणि जीपीएस स्थान",
      modalSubtitle: "बंगळुरू मेट्रो सेवा क्षेत्र",
      savedAddressesTab: "सेव्ह केलेले पत्ते",
      enterAddressTab: "पत्ता प्रविष्ट करा",
      locateOnMapTab: "नकाशावर शोधा",
      home: "घर",
      work: "कार्यालय",
      other: "इतर",
      confirmUseThis: "पुष्टी करा आणि हा पत्ता वापरा"
    },
    delivery: {
      fleetDutyOnline: "ड्यूटी: ऑनलाइन",
      fleetDutyOffline: "ड्यूटी: ऑफलाइन",
      activeTripsTab: "सक्रिय ट्रिप्स",
      availableAssignmentsTab: "उपलब्ध कामे",
      completedJobsTab: "पूर्ण डिलिव्हरी",
      earningsLedgerTab: "कमाई खाते"
    },
    tailor: {
      availableBadge: "उपलब्ध",
      busyBadge: "व्यस्त",
      closedBadge: "बंद",
      ordersQueueTab: "ऑर्डर रांग",
      menuBuilderTab: "डिजिटल मेनू",
      profileTab: "दुकान प्रोफाइल",
      financialsTab: "कमाई आणि पेआउट्स"
    },
    auth: {
      welcomeBack: "पुन्हा स्वागत आहे",
      joinSilai: "SILAI मध्ये सामील व्हा",
      loginTab: "लॉग इन",
      registerTab: "साइन अप",
      forgotPasswordTab: "पासवर्ड विसरलात"
    }
  },
  gu: {
    booking: {
      commissionBadge: "કસ્ટમ કારીગરી સિલાઈ",
      masterArtisan: "પ્રમાણિત માસ્ટર દરજી",
      fitGuarantee100: "૧૦૦% પરફેક્ટ ફિટ ગેરંટી",
      step1Title: "૧. સિલાઈ સેવા અને ડિઝાઇન પસંદ કરો",
      servicesAvailable: "ઉપલબ્ધ સેવાઓ",
      days: "દિવસ",
      step2Title: "૨. કપડાંની સંખ્યા",
      quantitySubtitle: "દરેક કપડા માટે પ્રીમિયમ સિલાઈ",
      step3Title: "૩. માપ આપવાની પદ્ધતિ પસંદ કરો",
      savedVault: "૧. સાચવેલ માપ",
      savedVaultDesc: "પ્રોફાઇલમાંથી માપ લો",
      manualTape: "૨. જાતે માપ દાખલ કરો",
      manualTapeDesc: "હમણાં જ માપ લખો",
      cloneOutfit: "૩. નમૂના કપડા આપો",
      cloneOutfitDesc: "નમૂના કપડા પિકઅપ",
      doorstepVisit: "૪. ઘરે માપ સેવા",
      doorstepVisitDesc: "માસ્ટર ઘરે આવશે",
      chooseFromSaved: "સાચવેલ પ્રોફાઇલમાંથી પસંદ કરો",
      createNewProfile: "નવી માપ પ્રોફાઇલ બનાવો",
      guidedTapeTitle: "ટેપ માપ",
      bustChest: "છાતીનું માપ",
      waist: "કમર",
      hips: "હિપ્સ",
      shoulder: "ખભા",
      step4Title: "૪. ડિઝાઇન અને સ્ટાઇલ પસંદગી",
      step5Title: "૫. સિલાઈ માટે ખાસ સૂચનાઓ",
      step6Title: "૬. સંપર્ક અને ડિલિવરી સરનામું",
      step7Title: "૭. કૂપન કોડ / ડિસ્કાઉન્ટ",
      reviewTitle: "ઓર્ડર સમીક્ષા અને પુષ્ટિ",
      orderSuccessTitle: "ઓર્ડર સફળતાપૂર્વક નોંધાયો",
      trackOrderBtn: "ઓર્ડર ટ્રેક કરો",
      doneBtn: "સંપૂર્ણ"
    },
    address: {
      modalTitle: "ડિલિવરી સરનામું અને જીપીએસ લોકેશન",
      modalSubtitle: "બેંગલુરુ મેટ્રો સેવા વિસ્તાર",
      savedAddressesTab: "સાચવેલા સરનામા",
      enterAddressTab: "સરનામું દાખલ કરો",
      locateOnMapTab: "નકશા પર શોધો",
      home: "ઘર",
      work: "ઓફિસ",
      other: "અન્ય",
      confirmUseThis: "પુષ્ટિ કરો અને આ સરનામું વાપરો"
    },
    delivery: {
      fleetDutyOnline: "ડ્યુટી: ઓનલાઇન",
      fleetDutyOffline: "ડ્યુટી: ઓફલાઇન",
      activeTripsTab: "સક્રિય ટ્રિપ્સ",
      availableAssignmentsTab: "ઉપલબ્ધ કામો",
      completedJobsTab: "પૂર્ણ ડિલિવરી",
      earningsLedgerTab: "કમાણી ખાતું"
    },
    tailor: {
      availableBadge: "ઉપલબ્ધ",
      busyBadge: "વ્યસ્ત",
      closedBadge: "બંધ",
      ordersQueueTab: "ઓર્ડર કતાર",
      menuBuilderTab: "ડિજિટલ મેનુ",
      profileTab: "દુકાન પ્રોફાઇલ",
      financialsTab: "કમાણી અને ચૂકવણી"
    },
    auth: {
      welcomeBack: "પુનઃ સ્વાગત છે",
      joinSilai: "SILAI માં જોડાઓ",
      loginTab: "લૉગ ઇન",
      registerTab: "સાઇન અપ",
      forgotPasswordTab: "પાસવર્ડ ભૂલી ગયા"
    }
  },
  ml: {
    booking: {
      commissionBadge: "പ്രത്യേക തയ്യൽ ഓർഡർ",
      masterArtisan: "സാക്ഷ്യപ്പെടുത്തിയ മാസ്റ്റർ ടെയ്‌ലർ",
      fitGuarantee100: "100% കൃത്യമായ ഫിറ്റ് ഉറപ്പ്",
      step1Title: "1. തയ്യൽ സേവനവും ഡിസൈനും തിരഞ്ഞെടുക്കുക",
      servicesAvailable: "ലഭ്യമായ സേവനങ്ങൾ",
      days: "ദിവസങ്ങൾ",
      step2Title: "2. വസ്ത്രങ്ങളുടെ എണ്ണം",
      quantitySubtitle: "ഓരോ വസ്ത്രത്തിനും മികച്ച തയ്യൽ",
      step3Title: "3. അളവ് എടുക്കുന്ന രീതി തിരഞ്ഞെടുക്കുക",
      savedVault: "1. സേവ് ചെയ്ത അളവുകൾ",
      savedVaultDesc: "പ്രൊഫൈൽ ഉപയോഗിക്കുക",
      manualTape: "2. അളവ് നേരിട്ട് നൽകുക",
      manualTapeDesc: "അളവുകൾ നൽകുക",
      cloneOutfit: "3. സാമ്പിൾ വസ്ത്രം നൽകുക",
      cloneOutfitDesc: "സാമ്പിൾ വസ്ത്ര പിക്കപ്പ്",
      doorstepVisit: "4. വീട്ടുപടിക്കൽ അളവ് സേവനം",
      doorstepVisitDesc: "മാസ്റ്റർ വീട്ടിലെത്തും",
      chooseFromSaved: "സേവ് ചെയ്ത പ്രൊഫൈലുകൾ",
      createNewProfile: "പുതിയ പ്രൊഫൈൽ നിർമ്മിക്കുക",
      guidedTapeTitle: "ടേപ്പ് അളവുകൾ",
      bustChest: "നെഞ്ചളവ്",
      waist: "അരക്കെട്ട്",
      hips: "ഇടുപ്പ്",
      shoulder: "തോൾ",
      step4Title: "4. ഡിസൈൻ മുൻഗണനകൾ",
      step5Title: "5. പ്രത്യേക നിർദ്ദേശങ്ങൾ",
      step6Title: "6. വിലാസവും ഫോൺ നമ്പറും",
      step7Title: "7. ഓഫർ കൂപ്പൺ",
      reviewTitle: "ഓർഡർ അവലോകനവും സ്ഥിരീകരണവും",
      orderSuccessTitle: "ഓർഡർ വിജയകരമായി നൽകി",
      trackOrderBtn: "ഓർഡർ ട്രാക്ക് ചെയ്യുക",
      doneBtn: "പൂർത്തിയായി"
    },
    address: {
      modalTitle: "ഡെലിവറി വിലാസവും ജിപിഎസും",
      modalSubtitle: "ബംഗളൂരു മെട്രോ സർവീസ് ഏരിയ",
      savedAddressesTab: "സേവ് ചെയ്ത വിലാസങ്ങൾ",
      enterAddressTab: "വിലാസം നൽകുക",
      locateOnMapTab: "മാപ്പിൽ കണ്ടെത്തുക",
      home: "വീട്",
      work: "ഓഫീസ്",
      other: "മറ്റുള്ളവ",
      confirmUseThis: "ഈ വിലാസം സ്ഥിരീകരിക്കുക"
    },
    delivery: {
      fleetDutyOnline: "ഡ്യൂട്ടി: ഓൺലൈൻ",
      fleetDutyOffline: "ഡ്യൂട്ടി: ഓഫ്‌ലൈൻ",
      activeTripsTab: "ആക്ടീവ് ട്രിപ്പുകൾ",
      availableAssignmentsTab: "ലഭ്യമായ ജോലികൾ",
      completedJobsTab: "പൂർത്തിയായവ",
      earningsLedgerTab: "വരുമാനം"
    },
    tailor: {
      availableBadge: "ലഭ്യമാണ്",
      busyBadge: "തിരക്കിലാണ്",
      closedBadge: "അടച്ചു",
      ordersQueueTab: "ഓർഡറുകൾ",
      menuBuilderTab: "ഡിജിറ്റൽ മെനു",
      profileTab: "ഷോപ്പ് പ്രൊഫൈൽ",
      financialsTab: "വരുമാനവും പേയ്‌മെന്റും"
    },
    auth: {
      welcomeBack: "സ്വാഗതം",
      joinSilai: "SILAI-ൽ ചേരുക",
      loginTab: "ലോഗിൻ",
      registerTab: "സൈൻ അപ്പ്",
      forgotPasswordTab: "പാസ്‌വേഡ് മറന്നോ"
    }
  },
  pa: {
    booking: {
      commissionBadge: "ਖਾਸ ਕਾਰੀਗਰੀ ਸਿਲਾਈ",
      masterArtisan: "ਪ੍ਰਮਾਣਿਤ ਮਾਸਟਰ ਦਰਜ਼ੀ",
      fitGuarantee100: "100% ਸਹੀ ਫਿੱਟ ਗਾਰੰਟੀ",
      step1Title: "1. ਸਿਲਾਈ ਸੇਵਾ ਅਤੇ ਡਿਜ਼ਾਈਨ ਚੁਣੋ",
      servicesAvailable: "ਉਪਲਬਧ ਸੇਵਾਵਾਂ",
      days: "ਦਿਨ",
      step2Title: "2. ਕੱਪੜਿਆਂ ਦੀ ਗਿਣਤੀ",
      quantitySubtitle: "ਹਰ ਕੱਪੜੇ ਲਈ ਬਿਹਤਰੀਨ ਸਿਲਾਈ",
      step3Title: "3. ਨਾਪ ਦੇਣ ਦਾ ਤਰੀਕਾ ਚੁਣੋ",
      savedVault: "1. ਸੰਭਾਲਿਆ ਹੋਇਆ ਨਾਪ",
      savedVaultDesc: "ਪ੍ਰੋਫਾਈਲ ਵਰਤੋਂ",
      manualTape: "2. ਖੁਦ ਨਾਪ ਭਰੋ",
      manualTapeDesc: "ਹੁਣੇ ਨਾਪ ਲਿਖੋ",
      cloneOutfit: "3. ਨਮੂਨਾ ਕੱਪੜਾ ਦਿਓ",
      cloneOutfitDesc: "ਨਮੂਨਾ ਕੱਪੜਾ ਪਿਕਅੱਪ",
      doorstepVisit: "4. ਘਰ ਬੈਠੇ ਨਾਪ ਸੇਵਾ",
      doorstepVisitDesc: "ਮਾਸਟਰ ਘਰ ਆਉਣਗੇ",
      chooseFromSaved: "ਸੰਭਾਲੀਆਂ ਪ੍ਰੋਫਾਈਲਾਂ ਚੁਣੋ",
      createNewProfile: "ਨਵੀਂ ਫਿੱਟ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ",
      guidedTapeTitle: "ਫੀਤਾ ਨਾਪ",
      bustChest: "ਛਾਤੀ ਦਾ ਨਾਪ",
      waist: "ਕਮਰ",
      hips: "ਕੁੱਲ੍ਹੇ",
      shoulder: "ਮੋਢਾ",
      step4Title: "4. ਡਿਜ਼ਾਈਨ ਅਤੇ ਸਟਾਈਲ ਪਸੰਦ",
      step5Title: "5. ਖਾਸ ਸਿਲਾਈ ਹਦਾਇਤਾਂ",
      step6Title: "6. ਸੰਪਰਕ ਅਤੇ ਡਿਲੀਵਰੀ ਪਤਾ",
      step7Title: "7. ਕੂਪਨ ਕੋਡ / ਛੋਟ",
      reviewTitle: "ਆਰਡਰ ਸਮੀਖਿਆ ਅਤੇ ਪੁਸ਼ਟੀ",
      orderSuccessTitle: "ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਹੋਇਆ",
      trackOrderBtn: "ਆਰਡਰ ਟ੍ਰੈਕ ਕਰੋ",
      doneBtn: "ਮੁਕੰਮਲ"
    },
    address: {
      modalTitle: "ਡਿਲੀਵਰੀ ਪਤਾ ਅਤੇ ਜੀਪੀਐਸ ਸਥਿਤੀ",
      modalSubtitle: "ਬੈਂਗਲੁਰੂ ਮੈਟਰੋ ਸੇਵਾ ਖੇਤਰ",
      savedAddressesTab: "ਸੰਭਾਲੇ ਪਤੇ",
      enterAddressTab: "ਪਤਾ ਦਰਜ ਕਰੋ",
      locateOnMapTab: "ਨਕਸ਼ੇ 'ਤੇ ਲੱਭੋ",
      home: "ਘਰ",
      work: "ਦਫ਼ਤਰ",
      other: "ਹੋਰ",
      confirmUseThis: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਇਹ ਪਤਾ ਵਰਤੋ"
    },
    delivery: {
      fleetDutyOnline: "ਡਿਊਟੀ: ਔਨਲਾਈਨ",
      fleetDutyOffline: "ਡਿਊਟੀ: ਔਫਲਾਈਨ",
      activeTripsTab: "ਸਰਗਰਮ ਟ੍ਰਿਪਾਂ",
      availableAssignmentsTab: "ਉਪਲਬਧ ਕੰਮ",
      completedJobsTab: "ਪੂਰੀਆਂ ਹੋਈਆਂ ਡਿਲੀਵਰੀਆਂ",
      earningsLedgerTab: "ਕਮਾਈ ਖਾਤਾ"
    },
    tailor: {
      availableBadge: "ਉਪਲਬਧ",
      busyBadge: "ਰੁੱਝੇ ਹੋਏ",
      closedBadge: "ਬੰਦ",
      ordersQueueTab: "ਆਰਡਰ ਕਤਾਰ",
      menuBuilderTab: "ਡਿਜੀਟਲ ਮੇਨੂ",
      profileTab: "ਦੁਕਾਨ ਪ੍ਰੋਫਾਈਲ",
      financialsTab: "ਕਮਾਈ ਅਤੇ ਭੁਗਤਾਨ"
    },
    auth: {
      welcomeBack: "ਜੀ ਆਇਆਂ ਨੂੰ",
      joinSilai: "SILAI ਨਾਲ ਜੁੜੋ",
      loginTab: "ਲਾਗ ਇਨ",
      registerTab: "ਸਾਈਨ ਅੱਪ",
      forgotPasswordTab: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ"
    }
  },
  or: {
    booking: {
      commissionBadge: "ସ୍ୱତନ୍ତ୍ର କାରିଗରୀ ସିଲେଇ",
      masterArtisan: "ପ୍ରମାଣିତ ମାଷ୍ଟର ଟେଲର",
      fitGuarantee100: "୧୦୦% ସଠିକ ଫିଟ୍ ଗ୍ୟାରେଣ୍ଟି",
      step1Title: "୧. ସିଲେଇ ସେବା ଚୟନ କରନ୍ତୁ",
      servicesAvailable: "ଉପଲବ୍ଧ ସେବା",
      days: "ଦିନ",
      step2Title: "୨. ପୋଷାକ ସଂଖ୍ୟା",
      quantitySubtitle: "ପ୍ରତି ପୋଷାକ ପାଇଁ ପ୍ରିମିୟମ ସିଲେଇ",
      step3Title: "୩. ମାପ ପଦ୍ଧତି ଚୟନ କରନ୍ତୁ",
      savedVault: "୧. ସାଇତା ମାପ",
      savedVaultDesc: "ପ୍ରୋଫାଇଲ୍ ବ୍ୟବହାର କରନ୍ତୁ",
      manualTape: "୨. ନିଜେ ମାପ ଦିଅନ୍ତୁ",
      manualTapeDesc: "ବର୍ତ୍ତମାନ ମାପ ଲେଖନ୍ତୁ",
      cloneOutfit: "୩. ନମୁନା ପୋଷାକ ଦିଅନ୍ତୁ",
      cloneOutfitDesc: "ନମୁନା ପୋଷାକ ପିକଅପ୍",
      doorstepVisit: "୪. ଘରେ ବସି ମାପ ସେବା",
      doorstepVisitDesc: "ମାଷ୍ଟର ଘରକୁ ଆସିବେ",
      chooseFromSaved: "ସାଇତା ପ୍ରୋଫାଇଲ୍ ରୁ ବାଛନ୍ତୁ",
      createNewProfile: "ନୂତନ ଫିଟ୍ ପ୍ରୋଫାଇଲ୍",
      guidedTapeTitle: "ଟେପ୍ ମାପ",
      bustChest: "ଛାତି ମାପ",
      waist: "ଅଣ୍ଟା",
      hips: "ନିତମ୍ବ",
      shoulder: "କାନ୍ଧ",
      step4Title: "୪. ଡିଜାଇନ୍ ପସନ୍ଦ",
      step5Title: "୫. ସ୍ୱତନ୍ତ୍ର ନିର୍ଦ୍ଦେଶ",
      step6Title: "୬. ଯୋଗାଯୋଗ ଓ ଠିକଣା",
      step7Title: "୭. କୁପନ୍ କୋଡ୍",
      reviewTitle: "ଅର୍ଡର ସମୀକ୍ଷା ଓ ନିଶ୍ଚିତକରଣ",
      orderSuccessTitle: "ଅର୍ଡର ସଫଳତାର ସହ ଗୃହୀତ ହେଲା",
      trackOrderBtn: "ଅର୍ଡର ଟ୍ରାକ୍ କରନ୍ତୁ",
      doneBtn: "ସମ୍ପୂର୍ଣ୍ଣ"
    },
    address: {
      modalTitle: "ଡେଲିଭରୀ ଠିକଣା ଓ ଜିପିଏସ୍",
      modalSubtitle: "ବେଙ୍ଗାଲୁରୁ ମେଟ୍ରୋ ସେବା କ୍ଷେତ୍ର",
      savedAddressesTab: "ସାଇତା ଠିକଣା",
      enterAddressTab: "ଠିକଣା ଲେଖନ୍ତୁ",
      locateOnMapTab: "ମାନଚିତ୍ରରେ ଖୋଜନ୍ତୁ",
      home: "ଘର",
      work: "ଅଫିସ୍",
      other: "ଅନ୍ୟାନ୍ୟ",
      confirmUseThis: "ନିଶ୍ଚିତ କରନ୍ତୁ ଓ ବ୍ୟବହାର କରନ୍ତୁ"
    },
    delivery: {
      fleetDutyOnline: "ଡ୍ୟୁଟି: ଅନଲାଇନ୍",
      fleetDutyOffline: "ଡ୍ୟୁଟି: ଅଫଲାଇନ୍",
      activeTripsTab: "ସକ୍ରିୟ ଟ୍ରିପ୍",
      availableAssignmentsTab: "ଉପଲବ୍ଧ କାର୍ଯ୍ୟ",
      completedJobsTab: "ସମ୍ପୂର୍ଣ୍ଣ ଡେଲିଭରୀ",
      earningsLedgerTab: "ଆୟ ଖାତା"
    },
    tailor: {
      availableBadge: "ଉପଲବ୍ଧ",
      busyBadge: "ବ୍ୟସ୍ତ",
      closedBadge: "ବନ୍ଦ",
      ordersQueueTab: "ଅର୍ଡର ଧାଡ଼ି",
      menuBuilderTab: "ଡିଜିଟାଲ୍ ମେନୁ",
      profileTab: "ଦୋକାନ ପ୍ରୋଫାଇଲ୍",
      financialsTab: "ଆୟ ଓ ପେଆଉଟ୍"
    },
    auth: {
      welcomeBack: "ସ୍ୱାଗତମ୍",
      joinSilai: "SILAI ରେ ଯୋଗ ଦିଅନ୍ତୁ",
      loginTab: "ଲଗ୍ ଇନ୍",
      registerTab: "ସାଇନ୍ ଅପ୍",
      forgotPasswordTab: "ପାସୱାର୍ଡ ଭୁଲିଗଲେ କି"
    }
  },
  as: {
    booking: {
      commissionBadge: "বিশেষ কাৰিকৰী চিলাই",
      masterArtisan: "প্ৰমাণিত মাষ্টাৰ দৰ্জী",
      fitGuarantee100: "১০০% সঠিক ফিট নিশ্চয়তা",
      step1Title: "১. চিলাই সেৱা বাছক",
      servicesAvailable: "উপলব্ধ সেৱা",
      days: "দিন",
      step2Title: "২. কাপোৰৰ সংখ্যা",
      quantitySubtitle: "প্ৰতিটো সাজৰ বাবে উৎকৃষ্ট চিলাই",
      step3Title: "৩. জোখ লোৱাৰ পদ্ধতি বাছক",
      savedVault: "১. সংৰক্ষিত জোখ",
      savedVaultDesc: "প্ৰ'ফাইল ব্যৱহাৰ কৰক",
      manualTape: "২. নিজে জোখ দিয়ক",
      manualTapeDesc: "এতিয়াই জোখ লিখক",
      cloneOutfit: "৩. নমুনা কাপোৰ দিয়ক",
      cloneOutfitDesc: "নমুনা কাপোৰ পিকআপ",
      doorstepVisit: "৪. ঘৰতে জোখ সেৱা",
      doorstepVisitDesc: "মাষ্টাৰ ঘৰলৈ আহিব",
      chooseFromSaved: "সংৰক্ষিত প্ৰ'ফাইলৰ পৰা বাছক",
      createNewProfile: "নতুন জোখ প্ৰ'ফাইল",
      guidedTapeTitle: "ফিটাৰ জোখ",
      bustChest: "বুকুৰ জোখ",
      waist: "কঁকাল",
      hips: "নিতম্ব",
      shoulder: "কান্ধ",
      step4Title: "৪. ডিজাইন পছন্দ",
      step5Title: "৫. বিশেষ নিৰ্দেশনা",
      step6Title: "৬. যোগাযোগ আৰু ঠিকনা",
      step7Title: "৭. কুপন ক'ড",
      reviewTitle: "অৰ্ডাৰ পৰ্যালোচনা আৰু নিশ্চিতকৰণ",
      orderSuccessTitle: "অৰ্ডাৰ সফলতাৰে গ্ৰহଣ কৰা হ'ল",
      trackOrderBtn: "অৰ্ডাৰ ট্ৰেক কৰক",
      doneBtn: "সম্পূৰ্ণ"
    },
    address: {
      modalTitle: "ডেলিভাৰী ঠিকনা আৰু জিপিএছ",
      modalSubtitle: "বেংগালুৰু মেট্ৰ' সেৱা এলেকা",
      savedAddressesTab: "সংৰক্ষিত ঠিকনা",
      enterAddressTab: "ঠিকনা লিখক",
      locateOnMapTab: "মানচিত্ৰত বিচাৰক",
      home: "ঘৰ",
      work: "কাৰ্যালয়",
      other: "অন্যান্য",
      confirmUseThis: "নিশ্চিত কৰি এই ঠিকনা ব্যৱহাৰ কৰক"
    },
    delivery: {
      fleetDutyOnline: "ডিউটি: অনলাইন",
      fleetDutyOffline: "ডিউটি: অফলাইন",
      activeTripsTab: "সক্ৰিয় ট্ৰিপ",
      availableAssignmentsTab: "উপলব্ধ কাম",
      completedJobsTab: "সম্পূৰ্ণ ডেলিভাৰী",
      earningsLedgerTab: "উপাৰ্জন খতিয়ান"
    },
    tailor: {
      availableBadge: "উপলব্ধ",
      busyBadge: "ব্যস্ত",
      closedBadge: "বন্ধ",
      ordersQueueTab: "অৰ্ডাৰ শাৰী",
      menuBuilderTab: "ডিজিটেল মেনু",
      profileTab: "দোকানৰ প্ৰ'ফাইল",
      financialsTab: "উপাৰ্জন আৰু পৰিশোধ"
    },
    auth: {
      welcomeBack: "পুনৰ স্বাগতম",
      joinSilai: "SILAI ত যোগদান কৰক",
      loginTab: "লগ ইন",
      registerTab: "ছাইন আপ",
      forgotPasswordTab: "পাছৱৰ্ড পাহৰিলে নেকি"
    }
  }
};

function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// Apply regional overrides to files
for (const lang of Object.keys(regional)) {
  const filePath = path.join(targetDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updated = deepMerge(data, regional[lang]);
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
    console.log(`Updated ${lang}.json with native regional overrides`);
  }
}
