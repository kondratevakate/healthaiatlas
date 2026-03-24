'use client'
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";

const SPECS=[
  {id:"all",l:"All",icon:"⊕"},{id:"onco",l:"Oncology",icon:"◉"},{id:"cosm",l:"Cosmetic",icon:"✧"},
  {id:"fert",l:"Fertility & Gender",icon:"♀"},{id:"card",l:"Cardiac",icon:"♥"},{id:"orth",l:"Ortho & Spine",icon:"◈"},
  {id:"well",l:"Wellness",icon:"❋"},{id:"dent",l:"Dental",icon:"◇"},{id:"birth",l:"Birth",icon:"✦"},
];

const SOURCES=[
  {id:"ng",label:"Nigeria",flag:"🇳🇬",vol:95,g:"+18%",specs:["onco","card","orth"]},
  {id:"ke",label:"Kenya",flag:"🇰🇪",vol:35,g:"+22%",specs:["onco","card","orth"]},
  {id:"gcc",label:"GCC",flag:"🇸🇦",vol:180,g:"+12%",specs:["onco","card","orth","cosm","well"]},
  {id:"eu",label:"Europe",flag:"🇪🇺",vol:220,g:"+8%",specs:["cosm","dent","fert","well","birth"]},
  {id:"uk",label:"UK",flag:"🇬🇧",vol:85,g:"+10%",specs:["fert","birth","cosm","onco","dent"]},
  {id:"cis",label:"CIS",flag:"🇷🇺",vol:140,g:"+15%",specs:["onco","fert","cosm","orth","dent"]},
  {id:"sa",label:"South Asia",flag:"🇧🇩",vol:310,g:"+20%",specs:["card","onco","orth"]},
  {id:"iq",label:"Iraq",flag:"🇮🇶",vol:85,g:"+25%",specs:["orth","card","onco"]},
  {id:"cn",label:"China",flag:"🇨🇳",vol:250,g:"+30%",specs:["cosm","fert","well","onco"]},
  {id:"jp",label:"Japan",flag:"🇯🇵",vol:120,g:"+35%",specs:["cosm","dent","well"]},
  {id:"in_o",label:"India (out)",flag:"🇮🇳",vol:60,g:"+20%",specs:["fert","birth","well"]},
  {id:"us",label:"USA",flag:"🇺🇸",vol:180,g:"+12%",specs:["cosm","dent","fert","well","orth"]},
];

const DESTS=[
  {id:"ae",label:"Dubai/UAE",flag:"🇦🇪",jci:92,specs:["cosm","dent","fert","orth","birth","well"],str:"Cosmetic, IVF/Gender, Dental, Birth"},
  {id:"in",label:"India",flag:"🇮🇳",jci:46,specs:["card","onco","orth","dent"],str:"Cardiac, Transplant, Oncology, Neuro"},
  {id:"ksa",label:"Saudi Arabia",flag:"🇸🇦",jci:111,specs:["onco","card","orth","well"],str:"Oncology, Complex Surgery, Seha Virtual"},
  {id:"th",label:"Thailand",flag:"🇹🇭",jci:68,specs:["cosm","dent","card","well"],str:"Cosmetic, Dental, Wellness, Gender"},
  {id:"tr",label:"Turkey",flag:"🇹🇷",jci:34,specs:["cosm","dent","orth","fert","onco"],str:"Hair, Cosmetic, Dental, Eye"},
  {id:"il",label:"Israel",flag:"🇮🇱",jci:12,specs:["onco","fert","card","orth"],str:"Oncology (blood cancer), IVF, Neuro"},
  {id:"de",label:"Germany",flag:"🇩🇪",jci:8,specs:["onco","card","orth","well"],str:"Oncology, Cardiac, Precision Medicine"},
  {id:"kr",label:"S. Korea",flag:"🇰🇷",jci:31,specs:["cosm","dent","well","onco"],str:"Derm (705K!), Cosmetic, K-beauty"},
];

const CORS=[
  {f:"ng",t:"ae",vol:28,spec:["onco","orth","card"],ch:"Facilitators + Direct",note:"Oncology + ortho"},
  {f:"ng",t:"in",vol:45,spec:["card","onco","orth"],ch:"Facilitators + Embassy",note:"Largest Africa→India"},
  {f:"ng",t:"tr",vol:12,spec:["cosm","dent"],ch:"Marketplace",note:"Growing cosmetic"},
  {f:"ke",t:"in",vol:22,spec:["onco","card","orth"],ch:"Facilitators + NGO",note:"Cancer + cardiac"},
  {f:"gcc",t:"in",vol:65,spec:["card","orth","onco"],ch:"Insurance + Direct",note:"Complex surgery"},
  {f:"gcc",t:"ae",vol:55,spec:["cosm","dent","well"],ch:"Direct + Referral",note:"Elective + wellness"},
  {f:"gcc",t:"de",vol:25,spec:["onco","card"],ch:"Insurance + Gov",note:"High-acuity oncology"},
  {f:"eu",t:"tr",vol:85,spec:["cosm","dent"],ch:"Marketplace-heavy",note:"Flymedi, WhatClinic"},
  {f:"eu",t:"ae",vol:48,spec:["cosm","dent","fert"],ch:"Marketplace + Direct",note:"IVF/gender growing"},
  {f:"eu",t:"th",vol:42,spec:["cosm","well","dent"],ch:"Marketplace",note:"Wellness combo trips"},
  {f:"uk",t:"ae",vol:18,spec:["fert","birth"],ch:"Direct + Clinics",note:"Gender selection (legal UAE, not UK) + birth"},
  {f:"uk",t:"tr",vol:30,spec:["cosm","dent"],ch:"Marketplace",note:"Dental + hair"},
  {f:"uk",t:"il",vol:8,spec:["onco","fert"],ch:"Direct + Referral",note:"Oncology 2nd opinions"},
  {f:"cis",t:"ae",vol:35,spec:["onco","fert","cosm"],ch:"Facilitators",note:"Oncology + IVF gender"},
  {f:"cis",t:"tr",vol:40,spec:["cosm","dent"],ch:"Marketplace",note:"Cosmetic + dental"},
  {f:"cis",t:"il",vol:30,spec:["onco","card"],ch:"Facilitators",note:"Hematology-oncology leader"},
  {f:"cis",t:"de",vol:20,spec:["onco","card","orth"],ch:"Clinics",note:"Cancer + cardiac"},
  {f:"cis",t:"kr",vol:15,spec:["cosm","dent"],ch:"Agencies",note:"K-beauty driven"},
  {f:"sa",t:"in",vol:180,spec:["card","onco","orth"],ch:"Direct + Visa",note:"Largest corridor globally"},
  {f:"iq",t:"in",vol:55,spec:["orth","card","onco"],ch:"Facilitator + Embassy",note:"Strong network"},
  {f:"iq",t:"ae",vol:20,spec:["orth","card"],ch:"Facilitator",note:"Proximity"},
  {f:"cn",t:"kr",vol:350,spec:["cosm","dent","well"],ch:"Hallyu + Marketplace",note:"31% of Korea tourists, K-pop effect"},
  {f:"cn",t:"ae",vol:15,spec:["fert","birth"],ch:"Direct + Agencies",note:"Gender selection (banned China, legal UAE)"},
  {f:"cn",t:"th",vol:40,spec:["cosm","well"],ch:"Marketplace",note:"Wellness + cosmetic"},
  {f:"jp",t:"kr",vol:400,spec:["cosm","dent","well"],ch:"Direct + Gangnam Unni",note:"#1 source Korea — 370K in 2024"},
  {f:"in_o",t:"ae",vol:25,spec:["fert","birth"],ch:"Direct + Clinics",note:"Gender selection (banned India, legal UAE)"},
  {f:"us",t:"kr",vol:70,spec:["cosm","dent"],ch:"Agencies + Social",note:"11.6% Korea cosmetic tourists"},
  {f:"us",t:"tr",vol:35,spec:["cosm","dent","orth"],ch:"Marketplace",note:"Hair + dental"},
  {f:"us",t:"ae",vol:12,spec:["fert"],ch:"Direct",note:"IVF $8-13K vs $25-30K US"},
];

// ═══ TIMELINE DATA ═══
const TL=[
  // 2021
  {y:2021,q:1,stream:"onco",dest:"il",name:"Israel Medical Tourism",desc:"~$500M/yr medical tourism revenue, 80% patients come for oncology",url:"https://bookinghealth.com/blog/diagnoses-and-treatment/diagnosis-and-treatment/603927-medical-tourism-to-israel.html",type:"stat"},
  {y:2021,q:1,stream:"card",dest:"in",name:"Apollo Hospitals Intl Patients",desc:"Serving patients from 120+ countries, dedicated intl patient centers",url:"https://www.apollohospitals.com/international-patients/",type:"provider"},
  {y:2021,q:1,stream:"cosm",dest:"th",name:"Bumrungrad 400K+ Intl Patients",desc:"Leading medical tourism hospital, 190+ countries served annually",url:"https://www.bumrungrad.com/",type:"provider"},
  {y:2021,q:2,stream:"cosm",dest:"kr",name:"Gangnam Unni Growth",desc:"Korea's #1 cosmetic surgery platform, 2.8M users, expanding to Japan/China",url:"https://unni.global/",type:"platform"},
  {y:2021,q:2,stream:"onco",dest:"de",name:"Germany 200K Intl Patients",desc:"Precision medicine leader — oncology, cardiology, orthopedics. Charité, Heidelberg",url:"https://medicaltourismbusiness.com/medical-tourism-statistics-by-country-facts-figures-destinations/",type:"stat"},
  {y:2021,q:2,stream:"fert",dest:"ae",name:"UAE Gender Selection Legal",desc:"IVF with PGT-A for family balancing legal in UAE — one of few countries globally",url:"https://bournhall-clinic.ae/can-we-choose-gender-in-ivf-in-dubai/",type:"regulatory"},
  {y:2021,q:3,stream:"well",dest:"th",name:"Thailand Medical Hub Strategy",desc:"Government-backed push to maintain Asia's top wellness + medical tourism destination",url:"https://www.bumrungrad.com/",type:"regulatory"},
  {y:2021,q:3,stream:"cosm",dest:"tr",name:"Turkey 1M+ Health Tourists",desc:"Hair transplant, cosmetic, dental — Europe→Turkey corridor dominant",url:"https://medicaltourismbusiness.com/medical-tourism-statistics-by-country-facts-figures-destinations/",type:"stat"},
  {y:2021,q:4,stream:"card",dest:"in",name:"India E-Medical Visa Program",desc:"Streamlined medical visa with multi-entry for treatment follow-up",url:"https://indianvisaonline.gov.in/evisa/tvoa.html",type:"regulatory"},
  // Standards
  {y:2021,q:2,stream:"onco",dest:"all",name:"G7 Commits to IPS Standard",desc:"G7 Health Ministers commit to International Patient Summary for cross-border data",url:"https://blog.hl7.org/advancing-the-international-patient-summary-ips",type:"standard"},
  {y:2021,q:3,stream:"card",dest:"all",name:"SNOMED CT IPS Production",desc:"First production release of IPS terminology — 8K+ coded clinical terms",url:"https://www.snomed.org/international-patient-summary-terminology",type:"standard"},

  // 2022
  {y:2022,q:1,stream:"onco",dest:"ksa",name:"Seha Virtual Hospital Launch",desc:"World's largest virtual hospital — 130+ hospitals, 30+ specialties, 400K capacity",url:"https://www.moh.gov.sa/en/ministry/projects/pages/seha-virtual-hospital.aspx",type:"provider"},
  {y:2022,q:1,stream:"cosm",dest:"ae",name:"Dubai 674K Medical Tourists",desc:"AED 992M spent — Asia 39%, Europe 22%, Arab/GCC 21%",url:"https://www.dha.gov.ae/en/media/news/823",type:"stat"},
  {y:2022,q:2,stream:"fert",dest:"ae",name:"Min. Economy + DHA MoU",desc:"UAE Ministry of Economy and DHA sign MoU to promote medical tourism",url:"https://www.moet.gov.ae/en/-/ministry-of-economy-and-dha-sign-mou-to-promote-medical-tourism-and-attract-more-health-tourists-to-the-uae",type:"regulatory"},
  {y:2022,q:2,stream:"onco",dest:"all",name:"EHDS Proposed (EU)",desc:"European Commission proposes European Health Data Space — cross-border health data framework",url:"https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en",type:"standard"},
  {y:2022,q:3,stream:"cosm",dest:"kr",name:"Korea Cosmetic Tourism 7x Jump",desc:"Foreign cosmetic patients surge from 52K to 383K in one year post-pandemic",url:"https://www.koreabiomed.com/news/articleView.html?idxno=25422",type:"stat"},
  {y:2022,q:3,stream:"onco",dest:"ksa",name:"Seha Oncology E-Platform",desc:"First oncology e-platform in MENA — tumor case review across Kingdom",url:"https://www.odysseyrecruitment.com/seha-virtual-hospital-saudi-arabia-world-s-largest-virtual-hospital",type:"provider"},
  {y:2022,q:3,stream:"cosm",dest:"ae",name:"DoH Abu Dhabi Med Tourism Redef.",desc:"Circular USO/235/2022 — updated medical tourism definition and reporting",url:"https://www.doh.gov.ae/en/shafafiya/reporting/reporting-of-medical-tourism-self-pay-and-non-insurance-claims",type:"regulatory"},
  {y:2022,q:4,stream:"dent",dest:"tr",name:"Turkey Dental Tourism Boom",desc:"1.2M+ health tourists, dental + hair transplant driving European flow",url:"https://medicaltourismbusiness.com/medical-tourism-statistics-by-country-facts-figures-destinations/",type:"stat"},
  {y:2022,q:4,stream:"fert",dest:"all",name:"HL7 FHIR IPS STU 1.1",desc:"Standard for international patient summary exchange via FHIR published",url:"https://hl7.org/fhir/uv/ips/STU1.1/",type:"standard"},

  // 2023
  {y:2023,q:1,stream:"cosm",dest:"kr",name:"Korea 606K Record",desc:"Record medical tourists — Japan 31%, China, dermatology dominant",url:"https://www.koreaherald.com/article/3381969",type:"stat"},
  {y:2023,q:1,stream:"onco",dest:"ksa",name:"Saudi 111 JCI Accredited",desc:"Highest JCI-accredited facilities globally — positioning for medical tourism",url:"https://medicaltravelmarket.com/news/saudi-arabia-plans-to-diversify-into-medical-tourism",type:"stat"},
  {y:2023,q:1,stream:"well",dest:"all",name:"MyHealth@EU Expands to 9 Countries",desc:"Cross-border patient summary exchange live in CY, EL, HU, IE, IT, LT, LV, SE, SI",url:"https://international-patient-summary.net/european-patient-summary-and-the-ips/",type:"standard"},
  {y:2023,q:2,stream:"cosm",dest:"all",name:"Better by MTA Platform Expand",desc:"Patient acquisition ecosystem — referral comms, secure docs, AI coordination",url:"https://www.better.medicaltourism.com/",type:"platform"},
  {y:2023,q:2,stream:"card",dest:"in",name:"Aster DM GCC/India Demerger",desc:"Splitting into separate GCC and India entities — 29 hospitals, 300+ clinics",url:"https://www.asterdmhealthcare.com/",type:"provider"},
  {y:2023,q:3,stream:"onco",dest:"il",name:"Israel Oncology 90% Success",desc:"CAR T-cell, targeted therapy, robotic surgery — Hadassah, Sheba, Sourasky",url:"https://us-uk.bookimed.com/article/medical-tourism-in-israel/",type:"provider"},
  {y:2023,q:4,stream:"cosm",dest:"kr",name:"Gangnam Unni ¥41.7B Revenue",desc:"Revenue up 70% YoY, turned profitable. Operating profit ¥12.2B",url:"https://www.koreabiomed.com/news/articleView.html?idxno=26640",type:"platform"},
  {y:2023,q:4,stream:"well",dest:"ksa",name:"Saudi Vision 2030 Med Tourism",desc:"150M tourists by 2030 target, healthcare as key diversification segment",url:"https://medicaltravelmarket.com/news/saudi-arabia-plans-to-diversify-into-medical-tourism",type:"regulatory"},

  // 2024
  {y:2024,q:1,stream:"cosm",dest:"ae",name:"CCAD 35% Intl Patient Growth",desc:"Cleveland Clinic Abu Dhabi reports 35% growth in international patients",url:"https://www.clevelandclinicabudhabi.ae/",type:"provider"},
  {y:2024,q:1,stream:"onco",dest:"all",name:"Epic + Google Adopt IPS",desc:"Major EHR vendors commit to International Patient Summary standard",url:"https://blog.hl7.org/topic/international-patient-summary",type:"standard"},
  {y:2024,q:1,stream:"cosm",dest:"kr",name:"Korea Dental Tourism +588%",desc:"Q3 2024 dental tourists surge nearly 7x — driven by competitive pricing",url:"https://jivaka.kr/blogs/blog/korean-medical-tourism-2026-complete-guide-to-changes-benefits-what-you-need-to-know",type:"stat"},
  {y:2024,q:2,stream:"fert",dest:"ae",name:"DoH Abu Dhabi Med Tourism Update",desc:"Circular USO/96/2024 — updated reporting requirements for medical tourism",url:"https://www.doh.gov.ae/en/shafafiya/reporting/reporting-of-medical-tourism-self-pay-and-non-insurance-claims",type:"regulatory"},
  {y:2024,q:2,stream:"cosm",dest:"kr",name:"Korea VAT Refund for Cosmetic",desc:"413K VAT refunds for foreign cosmetic patients by June, surpassing all 2023",url:"https://www.koreabiomed.com/news/articleView.html?idxno=25422",type:"regulatory"},
  {y:2024,q:3,stream:"onco",dest:"all",name:"EU Parliament Adopts EHDS",desc:"European Health Data Space regulation adopted — cross-border patient data framework",url:"https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en",type:"standard"},
  {y:2024,q:3,stream:"well",dest:"ksa",name:"Saudi Digital Health Twin",desc:"30M+ users via Sehhaty app — AI models for virtual health replicas",url:"https://lucidityinsights.com/articles/seha-virtual-hospital-sehhaty-app",type:"provider"},
  {y:2024,q:4,stream:"cosm",dest:"kr",name:"Korea 1.17M Record (2024)",desc:"Nearly double 2023 — Japan + China = 60%. Dermatology 56%, cosmetic 11%",url:"https://www.korea.net/NewsFocus/Society/view?articleId=269202",type:"stat"},
  {y:2024,q:4,stream:"cosm",dest:"kr",name:"Gangnam Unni UNNI Global",desc:"Multi-language platform — 104 countries, Thai launch, 300K Japan consultations",url:"https://unni.global/",type:"platform"},
  {y:2024,q:4,stream:"fert",dest:"ae",name:"Dubai IVF Gender Selection Boom",desc:"IVF $8-13K vs $25-30K in US. Legal for family balancing. China, India, UK inbound",url:"https://www.placidway.com/article/6447/7-Things-to-Know-About-IVF-with-Gender-Selection-in-Dubai-UAE",type:"provider"},

  // 2025
  {y:2025,q:1,stream:"onco",dest:"all",name:"EHDS In Force (Mar 2025)",desc:"EU Regulation 2025/327 enters force. Patient Summaries mandated by 2029",url:"https://eur-lex.europa.eu/eli/reg/2025/327/oj/eng",type:"standard"},
  {y:2025,q:1,stream:"cosm",dest:"kr",name:"Gangnam Unni $30M Series C",desc:"Global expansion — Japan (370K consultations), Thailand, B2B CRM tools",url:"https://www.koreabiomed.com/news/articleView.html?idxno=26640",type:"platform"},
  {y:2025,q:1,stream:"onco",dest:"ksa",name:"Seha 224+ Hospitals Connected",desc:"597K+ annual capacity, 44 specialties, The Sandbox healthtech incubator",url:"https://lucidityinsights.com/articles/seha-virtual-hospital-sehhaty-app",type:"provider"},
  {y:2025,q:1,stream:"onco",dest:"all",name:"EN-ISO 27269:2025 Published",desc:"Updated international standard for patient summary dataset specification",url:"https://www.ehealth-standards.eu/2023/09/11/a-short-and-clear-introduction-to-the-international-patient-summary-ips/",type:"standard"},
  {y:2025,q:1,stream:"cosm",dest:"kr",name:"Korea 700K Target by 2027",desc:"Government goal — medical tourism as economic catalyst, 10x tourist spending",url:"https://www.koreaherald.com/article/3381969",type:"regulatory"},
];

const TYPE_COLORS={stat:"#3b82f6",platform:"#8b5cf6",provider:"#22c55e",regulatory:"#f59e0b",standard:"#06b6d4"};
const TYPE_LABELS={stat:"Market Data",platform:"Platform",provider:"Provider",regulatory:"Regulatory",standard:"Standard"};

const VENDORS={
  discovery:[{n:"Bookimed",t:"Marketplace",c:"Global",s:"700+ clinics",u:"https://bookimed.com"},{n:"PlacidWay",t:"Marketplace",c:"Global",s:"200+ providers",u:"https://placidway.com"},{n:"WhatClinic",t:"Search",c:"Global",s:"10K+ clinics",u:"https://whatclinic.com"},{n:"Flymedi",t:"Marketplace",c:"EU↔Turkey",s:"Cosmetic",u:"https://flymedi.com"},{n:"DXH Dubai",t:"Gov",c:"Dubai",s:"DHA official",u:"https://dxh.ae"},{n:"Gangnam Unni",t:"Marketplace",c:"Korea",s:"$30M C, 7M users",u:"https://unni.global"},{n:"Himedi",t:"Concierge",c:"→Korea",s:"N.America+ME",u:"https://himedi.co.kr"},{n:"Better by MTA",t:"Association",c:"Global",s:"Provider net",u:"https://www.better.medicaltourism.com"}],
  crm:[{n:"LeadSquared",t:"Healthcare CRM",c:"India,ME,SEA",s:"$153M",u:"https://leadsquared.com"},{n:"Salesforce HC",t:"Enterprise",c:"Global",s:"Leader",u:"https://salesforce.com"},{n:"HubSpot",t:"CRM+Mktg",c:"Global",s:"HIPAA",u:"https://hubspot.com"},{n:"Health Tourism CRM",t:"Niche",c:"Med tourism",s:"Niche",u:"https://healthtourismcrm.com"}],
  payments:[{n:"Flywire",t:"Cross-border",c:"Global",s:"IPO",u:"https://flywire.com"},{n:"PatientFi",t:"Financing",c:"USA+",s:"$50M",u:"https://patientfi.com"},{n:"PayTabs",t:"MENA",c:"GCC",s:"Regional",u:"https://paytabs.com"}],
  intelligence:[{n:"Celonis",t:"Process Mining",c:"Global",s:"$13B",u:"https://celonis.com"},{n:"IQVIA NBA",t:"NBA Engine",c:"LifeSci",s:"Enterprise",u:"https://iqvia.com"},{n:"Innovaccer",t:"Health Data",c:"Global",s:"$3.2B",u:"https://innovaccer.com"}],
  standards:[{n:"HL7 FHIR IPS",t:"Standard",c:"Global",s:"EHR adopting",u:"https://hl7.org/fhir/uv/ips/"},{n:"SNOMED IPS",t:"Terminology",c:"Global",s:"8K+ terms",u:"https://www.snomed.org/international-patient-summary-terminology"},{n:"EHDS",t:"EU Reg",c:"Europe",s:"In force 2025",u:"https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space-regulation-ehds_en"}],
};

const STAGES=[
  {id:"aw",label:"Discovery",short:"Discovery",icon:"◉",desc:"How patients find you",qs:[{id:"q1",text:"Listed on 3+ intl directories",w:2},{id:"q2",text:"Multilingual procedure pages",w:3},{id:"q3",text:"Corridor-specific channels active",w:2},{id:"q4",text:"Gov platform listed (DXH, MTA)",w:2},{id:"q5",text:"Physician referral network",w:3}],prods:[{name:"Directory Listings",type:"buy",effort:"low",impact:"high",players:["Bookimed","PlacidWay"]},{name:"Multilingual SEO",type:"build",effort:"medium",impact:"high",players:["Agency"]},{name:"Referral CRM",type:"buy",effort:"medium",impact:"high",players:["Salesforce","LeadSquared"]}]},
  {id:"iq",label:"Inquiry",short:"Inquiry",icon:"◈",desc:"First response and capture",qs:[{id:"q6",text:"Response <2hrs for intl inquiries",w:3},{id:"q7",text:"Dedicated intl coordinator team",w:3},{id:"q8",text:"Structured intake form",w:2},{id:"q9",text:"WhatsApp Business + bot",w:2},{id:"q10",text:"Lead source tracking",w:3}],prods:[{name:"WhatsApp API",type:"buy",effort:"low",impact:"high",players:["WATI","Twilio"]},{name:"Patient CRM",type:"buy",effort:"medium",impact:"high",players:["LeadSquared","HubSpot"]},{name:"Intake Workflow",type:"build",effort:"low",impact:"high",players:["In-house"]}]},
  {id:"es",label:"Estimate",short:"Estimate",icon:"◆",desc:"Qualification and pricing",qs:[{id:"q11",text:"Structured qualification process",w:3},{id:"q12",text:"Estimate within 48hrs",w:3},{id:"q13",text:"Doctor video before travel",w:2},{id:"q14",text:"Itemized price transparency",w:2},{id:"q15",text:"Know competitor pricing",w:2}],prods:[{name:"Virtual 2nd Opinion",type:"buy",effort:"medium",impact:"high",players:["Teladoc"]},{name:"Estimate Generator",type:"build",effort:"medium",impact:"high",players:["Custom"]}]},
  {id:"tr",label:"Trust",short:"Trust",icon:"◇",desc:"Building commitment",qs:[{id:"q16",text:"Corridor testimonials available",w:3},{id:"q17",text:"JCI communicated everywhere",w:2},{id:"q18",text:"Doctor credentials transparent",w:2},{id:"q19",text:"Family support info proactive",w:1},{id:"q20",text:"Financing / payment plans",w:3}],prods:[{name:"Patient Financing",type:"buy",effort:"medium",impact:"high",players:["Flywire","PatientFi"]},{name:"Testimonial System",type:"build",effort:"low",impact:"high",players:["In-house"]}]},
  {id:"lg",label:"Logistics",short:"Logistics",icon:"◫",desc:"Pre-arrival coordination",qs:[{id:"q21",text:"Visa letter <24hrs",w:2},{id:"q22",text:"Airport + hotel in package",w:2},{id:"q23",text:"Pre-arrival checklist tracked",w:3},{id:"q24",text:"Multi-method payments",w:2},{id:"q25",text:"Clinical handoff protocol",w:3}],prods:[{name:"Cross-Border Payments",type:"buy",effort:"low",impact:"high",players:["Flywire","PayTabs"]},{name:"Patient Portal",type:"build",effort:"high",impact:"high",players:["Custom"]},{name:"Handoff Protocol",type:"build",effort:"low",impact:"high",players:["In-house"]}]},
  {id:"tx",label:"Treatment",short:"Treatment",icon:"✦",desc:"Care and record portability",qs:[{id:"q26",text:"Interpreter support",w:2},{id:"q27",text:"Family updates during treatment",w:2},{id:"q28",text:"Intl patient ward",w:1},{id:"q29",text:"Satisfaction measured during stay",w:2},{id:"q30",text:"IPS discharge summary",w:3}],prods:[{name:"IPS Discharge (SNOMED/FHIR)",type:"build",effort:"medium",impact:"high",players:["EHR + HL7"]},{name:"Family Comms",type:"buy",effort:"low",impact:"medium",players:["WhatsApp"]}]},
  {id:"fu",label:"Follow-Up",short:"Follow-Up",icon:"⟐",desc:"Retention and referrals",qs:[{id:"q31",text:"Structured follow-up protocol",w:3},{id:"q32",text:"Virtual follow-up consultations",w:3},{id:"q33",text:"NPS by corridor/procedure",w:2},{id:"q34",text:"Referral program with incentives",w:3},{id:"q35",text:"Outcome tracking intl patients",w:2}],prods:[{name:"Follow-Up Sequences",type:"buy",effort:"low",impact:"high",players:["CRM automation"]},{name:"Virtual Follow-Up",type:"buy",effort:"medium",impact:"high",players:["Teladoc"]},{name:"Referral Engine",type:"build",effort:"medium",impact:"high",players:["In-house"]}]},
];

const M="'JetBrains Mono',monospace",S="'DM Sans',sans-serif";
const sc=s=>s>=75?"#22c55e":s>=50?"#eab308":s>=25?"#f97316":"#ef4444";

export default function MedicalTourism(){
  const[tab,setTab]=useState("map");
  const[ans,setAns]=useState({});
  const[selSrc,ss1]=useState(null);
  const[selDst,sd1]=useState(null);
  const[hovCor,shc]=useState(null);
  const[vF,svf]=useState("all");
  const[spF,ssf]=useState("all");
  const[tlF,stlf]=useState("all");
  const[openSt,sos]=useState(null);

  const stSc=i=>{const s=STAGES[i];let t=0,m=0;s.qs.forEach(q=>{m+=q.w*2;const a=ans[q.id];if(a==="y")t+=q.w*2;else if(a==="p")t+=q.w;});return m?Math.round(t/m*100):0;};
  const ov=()=>{let t=0;STAGES.forEach((_,i)=>t+=stSc(i));return Math.round(t/STAGES.length);};
  const done=STAGES.every(s=>s.qs.every(q=>ans[q.id]));
  const maxV=Math.max(...CORS.map(c=>c.vol));
  const fC=useMemo(()=>CORS.filter(c=>{if(spF!=="all"&&!c.spec.includes(spF))return false;if(selSrc&&c.f!==selSrc)return false;if(selDst&&c.t!==selDst)return false;return true;}),[spF,selSrc,selDst]);
  const fS=useMemo(()=>spF==="all"?SOURCES:SOURCES.filter(s=>s.specs.includes(spF)),[spF]);
  const fD=useMemo(()=>spF==="all"?DESTS:DESTS.filter(d=>d.specs.includes(spF)),[spF]);
  const fTL=useMemo(()=>tlF==="all"?TL:TL.filter(e=>e.stream===tlF),[tlF]);
  const prods=()=>{let p=[];STAGES.forEach((s,i)=>{const sc2=stSc(i);s.prods.forEach(pr=>{const ps=(100-sc2)*(pr.impact==="high"?3:2)/(pr.effort==="low"?1:pr.effort==="medium"?2:3);p.push({...pr,stage:s.short,stageScore:sc2,ps});});});return p.sort((a,b)=>b.ps-a.ps);};
  const YEARS=[2021,2022,2023,2024,2025];

  return(
  <div>
    {/* Page header */}
    <div className="px-6 md:px-8 py-4 border-b border-border">
      <h1 className="text-accent font-bold text-lg">Medical Tourism</h1>
      <p className="text-muted text-sm">Corridor opportunity map, timeline, and diagnostic tool</p>
    </div>

    {/* Sub-nav tab switcher */}
    <div className="px-6 md:px-8 py-2 border-b border-border flex gap-1">
      {[{id:"map",l:"Corridors"},{id:"timeline",l:"Timeline"},{id:"assess",l:"Diagnostic"},{id:"results",l:"Results",dis:!done}].map(t=>(
        <button
          key={t.id}
          onClick={()=>!t.dis&&setTab(t.id)}
          disabled={t.dis}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
            tab===t.id
              ? 'bg-surface-2 text-foreground border-accent'
              : t.dis
              ? 'bg-transparent text-muted/30 border-border cursor-not-allowed'
              : 'bg-transparent text-muted border-border hover:bg-surface-2 hover:text-foreground hover:border-accent cursor-pointer'
          }`}
        >
          {t.l}
        </button>
      ))}
    </div>

    {/* ═══════ MAP ═══════ */}
    {tab==="map"&&(
    <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px"}}>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:26,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>Corridor Opportunity Map</h1>
        <p style={{color:"#94a3b8",fontSize:12}}>Filter by specialty. Click source/destination. Circle = volume. Hover lines for detail.</p>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
        {SPECS.map(sp=>(<button key={sp.id} onClick={()=>{ssf(sp.id);ss1(null);sd1(null);}} style={{padding:"5px 12px",borderRadius:16,border:"none",fontSize:10,background:spF===sp.id?"#8b5cf620":"#1e293b",color:spF===sp.id?"#a78bfa":"#94a3b8",cursor:"pointer",boxShadow:spF===sp.id?"inset 0 0 0 1px #8b5cf650":"inset 0 0 0 1px #334155"}}>{sp.icon} {sp.l}</button>))}
      </div>
      <div style={{background:"#0f172a",borderRadius:12,border:"1px solid #1e293b",padding:"20px 14px",marginBottom:20,minHeight:Math.max(fS.length,fD.length)*48+40}}>
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr 220px",gap:0,minHeight:Math.max(fS.length,fD.length)*46}}>
          <div style={{display:"flex",flexDirection:"column",gap:3,justifyContent:"space-around"}}>
            {fS.map(s=>{const isSel=selSrc===s.id;const vol=CORS.filter(c=>c.f===s.id&&(spF==="all"||c.spec.includes(spF))).reduce((a,c)=>a+c.vol,0);const r=Math.max(9,Math.min(24,(vol/maxV)*30));
              return(<button key={s.id} onClick={()=>{ss1(isSel?null:s.id);sd1(null);}} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 8px",background:isSel?"#1e3a5f":"#1e293b",border:isSel?"1.5px solid #3b82f6":"1px solid #334155",borderRadius:7,cursor:"pointer",opacity:!selSrc||isSel?1:0.2,transition:"all 0.2s",textAlign:"left"}}>
                <div style={{width:r*2,height:r*2,minWidth:r*2,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%,#3b82f640,#3b82f610)",border:"1px solid #3b82f650",display:"flex",alignItems:"center",justifyContent:"center",fontSize:r>14?10:8,fontFamily:M,color:"#60a5fa",fontWeight:600}}>{vol||"—"}</div>
                <div><div style={{fontSize:11,fontWeight:600,color:"#e2e8f0"}}>{s.flag} {s.label}</div><div style={{fontSize:8,color:"#22c55e",fontFamily:M}}>{s.g}</div></div>
              </button>);
            })}
          </div>
          <div style={{position:"relative"}}>
            <svg width="100%" height="100%" viewBox={`0 0 400 ${Math.max(fS.length,fD.length)*46}`} preserveAspectRatio="none" style={{position:"absolute",inset:0}}>
              {fC.map((c,ci)=>{const si=fS.findIndex(s=>s.id===c.f);const di=fD.findIndex(d=>d.id===c.t);if(si<0||di<0)return null;const h=Math.max(fS.length,fD.length)*46;const sy=(si+.5)/fS.length*h;const dy=(di+.5)/fD.length*h;const sw=Math.max(1,(c.vol/maxV)*9);const isA=(!selSrc||c.f===selSrc)&&(!selDst||c.t===selDst);
                return<path key={ci} d={`M0 ${sy}C160 ${sy},240 ${dy},400 ${dy}`} fill="none" stroke={hovCor===ci?"#60a5fa":"#3b82f6"} strokeWidth={sw} opacity={isA?(hovCor===ci?.7:.25):.03} style={{transition:"all .2s",cursor:"pointer"}} onMouseEnter={()=>shc(ci)} onMouseLeave={()=>shc(null)}/>;
              })}
            </svg>
            {hovCor!==null&&(()=>{const c=fC[hovCor];if(!c)return null;const sl=SOURCES.find(s=>s.id===c.f);const dl=DESTS.find(d=>d.id===c.t);
              return(<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#1e293bee",backdropFilter:"blur(8px)",borderRadius:10,padding:"12px 16px",border:"1px solid #3b82f650",minWidth:200,pointerEvents:"none",zIndex:10,animation:"fu .15s ease"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",marginBottom:3}}>{sl?.flag} → {dl?.flag} {dl?.label}</div>
                <div style={{fontSize:18,fontWeight:700,color:"#60a5fa",fontFamily:M,marginBottom:3}}>{c.vol}K <span style={{fontSize:10,color:"#22c55e"}}>pts/yr</span></div>
                <div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>{c.spec.map(s=>SPECS.find(sp=>sp.id===s)?.l).filter(Boolean).join(", ")}</div>
                <div style={{fontSize:9,color:"#64748b"}}>{c.ch} — {c.note}</div>
              </div>);
            })()}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3,justifyContent:"space-around"}}>
            {fD.map(d=>{const isSel=selDst===d.id;const vol=CORS.filter(c=>c.t===d.id&&(spF==="all"||c.spec.includes(spF))).reduce((a,c)=>a+c.vol,0);const r=Math.max(9,Math.min(24,(vol/maxV)*30));
              return(<button key={d.id} onClick={()=>{sd1(isSel?null:d.id);ss1(null);}} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 8px",background:isSel?"#1e3a5f":"#1e293b",border:isSel?"1.5px solid #8b5cf6":"1px solid #334155",borderRadius:7,cursor:"pointer",opacity:!selDst||isSel?1:0.2,transition:"all 0.2s",textAlign:"left"}}>
                <div style={{width:r*2,height:r*2,minWidth:r*2,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%,#8b5cf640,#8b5cf610)",border:"1px solid #8b5cf650",display:"flex",alignItems:"center",justifyContent:"center",fontSize:r>14?10:8,fontFamily:M,color:"#a78bfa",fontWeight:600}}>{vol||"—"}</div>
                <div><div style={{fontSize:11,fontWeight:600,color:"#e2e8f0"}}>{d.flag} {d.label}</div><div style={{fontSize:8,color:"#94a3b8"}}>{d.str.split(",").slice(0,2).join(",")}</div></div>
              </button>);
            })}
          </div>
        </div>
      </div>
      {(selSrc||selDst)&&fC.length>0&&(
        <div style={{background:"#1e293b",borderRadius:10,padding:16,marginBottom:20,border:"1px solid #334155",animation:"fu .2s ease"}}>
          {fC.map((c,i)=>{const sl=SOURCES.find(s=>s.id===c.f);const dl=DESTS.find(d=>d.id===c.t);
            return(<div key={i} style={{padding:"10px 12px",background:"#0f172a",borderRadius:6,marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{sl?.flag}→{dl?.flag} {dl?.label}</span><span style={{fontSize:14,fontWeight:700,color:"#60a5fa",fontFamily:M}}>{c.vol}K</span></div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:3}}>{c.spec.map(sp=><span key={sp} style={{fontSize:8,padding:"1px 6px",borderRadius:8,background:"#8b5cf615",color:"#a78bfa",fontFamily:M}}>{SPECS.find(s=>s.id===sp)?.l}</span>)}</div>
              <div style={{fontSize:9,color:"#64748b"}}>{c.ch} — {c.note}</div>
            </div>);
          })}
        </div>
      )}
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:M,fontSize:9,letterSpacing:2,color:"#64748b",marginBottom:8}}>VENDORS</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>
          {[{id:"all",l:"All"},{id:"discovery",l:"Discovery"},{id:"crm",l:"CRM"},{id:"payments",l:"Payments"},{id:"intelligence",l:"Analytics"},{id:"standards",l:"Standards"}].map(f=>(
            <button key={f.id} onClick={()=>svf(f.id)} style={{padding:"4px 10px",borderRadius:12,border:"none",fontSize:10,background:vF===f.id?"#3b82f620":"#1e293b",color:vF===f.id?"#60a5fa":"#94a3b8",cursor:"pointer",boxShadow:vF===f.id?"inset 0 0 0 1px #3b82f650":"inset 0 0 0 1px #334155"}}>{f.l}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6}}>
          {Object.entries(VENDORS).filter(([c])=>vF==="all"||c===vF).flatMap(([,vs])=>vs).map((v,i)=>(
            <a key={i} href={v.u} target="_blank" rel="noopener" style={{background:"#1e293b",borderRadius:7,padding:"9px 11px",border:"1px solid #334155",display:"block",cursor:"pointer",transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#3b82f6"} onMouseLeave={e=>e.currentTarget.style.borderColor="#334155"}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,fontWeight:600,color:"#e2e8f0"}}>{v.n}</span><span style={{fontSize:7,padding:"1px 5px",borderRadius:6,background:"#0f172a",color:"#64748b",fontFamily:M}}>{v.t}</span></div>
              <div style={{fontSize:9,color:"#94a3b8"}}>{v.c} · {v.s}</div>
            </a>
          ))}
        </div>
      </div>
    </div>)}

    {/* ═══════ TIMELINE ═══════ */}
    {tab==="timeline"&&(
    <div style={{maxWidth:1200,margin:"0 auto",padding:"24px 20px"}}>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:26,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>Ecosystem Timeline</h1>
        <p style={{color:"#94a3b8",fontSize:12}}>Key events by year. Click any card to open source. Filter by specialty stream.</p>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
        {SPECS.map(sp=>(<button key={sp.id} onClick={()=>stlf(sp.id)} style={{padding:"5px 12px",borderRadius:16,border:"none",fontSize:10,background:tlF===sp.id?"#8b5cf620":"#1e293b",color:tlF===sp.id?"#a78bfa":"#94a3b8",cursor:"pointer",boxShadow:tlF===sp.id?"inset 0 0 0 1px #8b5cf650":"inset 0 0 0 1px #334155"}}>{sp.icon} {sp.l}</button>))}
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:20}}>
        {Object.entries(TYPE_LABELS).map(([k,v])=>(<span key={k} style={{fontSize:9,padding:"3px 8px",borderRadius:10,background:`${TYPE_COLORS[k]}15`,color:TYPE_COLORS[k],fontFamily:M}}>{v}</span>))}
      </div>

      {/* Timeline grid */}
      <div style={{position:"relative"}}>
        {/* Year headers */}
        <div style={{display:"grid",gridTemplateColumns:`repeat(${YEARS.length},1fr)`,gap:8,marginBottom:12,position:"sticky",top:48,zIndex:5,background:"#111827ee",backdropFilter:"blur(8px)",padding:"8px 0"}}>
          {YEARS.map(y=>(<div key={y} style={{textAlign:"center",fontFamily:M,fontSize:16,fontWeight:700,color:"#475569"}}>{y}</div>))}
        </div>
        {/* Year columns with cards */}
        <div style={{display:"grid",gridTemplateColumns:`repeat(${YEARS.length},1fr)`,gap:8,alignItems:"start"}}>
          {YEARS.map(y=>{
            const evts=fTL.filter(e=>e.y===y);
            return(<div key={y} style={{display:"flex",flexDirection:"column",gap:6}}>
              {evts.length===0&&<div style={{fontSize:10,color:"#334155",textAlign:"center",padding:20}}>No events</div>}
              {evts.map((e,i)=>{
                const dest=e.dest==="all"?null:DESTS.find(d=>d.id===e.dest);
                return(
                  <a key={i} href={e.url} target="_blank" rel="noopener noreferrer" style={{
                    background:"#1e293b",borderRadius:8,padding:"10px 12px",border:"1px solid #334155",
                    borderLeft:`3px solid ${TYPE_COLORS[e.type]}`,cursor:"pointer",display:"block",
                    transition:"all .2s",textDecoration:"none",color:"inherit",
                  }} onMouseEnter={ev=>ev.currentTarget.style.borderColor="#64748b"} onMouseLeave={ev=>{ev.currentTarget.style.borderColor="#334155";}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                      <span style={{fontSize:7,padding:"1px 5px",borderRadius:6,background:`${TYPE_COLORS[e.type]}20`,color:TYPE_COLORS[e.type],fontFamily:M}}>{TYPE_LABELS[e.type]}</span>
                      {dest&&<span style={{fontSize:10}}>{dest.flag}</span>}
                      {!dest&&<span style={{fontSize:8,color:"#64748b"}}>🌐</span>}
                    </div>
                    <div style={{fontSize:11,fontWeight:600,color:"#e2e8f0",marginBottom:3,lineHeight:1.3}}>{e.name}</div>
                    <div style={{fontSize:9,color:"#94a3b8",lineHeight:1.4}}>{e.desc}</div>
                    <div style={{marginTop:4,display:"flex",gap:4}}>
                      <span style={{fontSize:8,padding:"1px 5px",borderRadius:6,background:"#8b5cf610",color:"#a78bfa",fontFamily:M}}>{SPECS.find(s=>s.id===e.stream)?.l}</span>
                      <span style={{fontSize:8,color:"#475569",fontFamily:M}}>Q{e.q}</span>
                    </div>
                  </a>
                );
              })}
            </div>);
          })}
        </div>
      </div>
    </div>)}

    {/* ═══════ ASSESS ═══════ */}
    {tab==="assess"&&(
    <div style={{maxWidth:860,margin:"0 auto",padding:"24px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"#f1f5f9"}}>Funnel Diagnostic</h1></div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:"#64748b",fontFamily:M}}>{Object.keys(ans).length}/35</div>
          {done&&<button onClick={()=>setTab("results")} style={{marginTop:3,padding:"5px 16px",borderRadius:5,border:"none",fontSize:11,fontWeight:600,background:"#3b82f6",color:"#fff",cursor:"pointer"}}>Results →</button>}
        </div>
      </div>
      {STAGES.map((stage,si)=>{const score=stSc(si);const hasA=stage.qs.some(q=>ans[q.id]);
        return(<div key={si} style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"#1e293b",borderRadius:"7px 7px 0 0"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:13,opacity:.4}}>{stage.icon}</span><div><div style={{fontSize:12,fontWeight:600,color:"#f1f5f9"}}>{stage.label}</div><div style={{fontSize:9,color:"#64748b"}}>{stage.desc}</div></div></div>
            <div style={{fontSize:16,fontWeight:700,fontFamily:M,color:hasA?sc(score):"#334155"}}>{hasA?`${score}%`:"—"}</div>
          </div>
          <div style={{background:"#0f172a",borderRadius:"0 0 7px 7px"}}>
            {stage.qs.map(q=>{const val=ans[q.id];return(
              <div key={q.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",padding:"8px 12px",borderTop:"1px solid #1e293b"}}>
                <div style={{fontSize:11,color:"#cbd5e1",lineHeight:1.3}}>{q.text}{q.w>=3&&<span style={{marginLeft:4,fontSize:7,color:"#f59e0b",fontFamily:M,verticalAlign:"super"}}>HIGH</span>}</div>
                <div style={{display:"flex",gap:2}}>
                  {[{k:"y",l:"Yes",c:"#22c55e"},{k:"p",l:"Part",c:"#eab308"},{k:"n",l:"No",c:"#ef4444"}].map(o=>(
                    <button key={o.k} onClick={()=>setAns(p=>({...p,[q.id]:o.k}))} style={{width:50,padding:"4px 0",borderRadius:4,border:"none",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:M,background:val===o.k?`${o.c}18`:"transparent",color:val===o.k?o.c:"#475569",boxShadow:val===o.k?`inset 0 0 0 1.5px ${o.c}`:"inset 0 0 0 1px #334155"}}>{o.l}</button>
                  ))}
                </div>
              </div>);})}
          </div>
        </div>);
      })}
    </div>)}

    {/* ═══════ RESULTS ═══════ */}
    {tab==="results"&&done&&(()=>{const o=ov();const weak=STAGES.map((s,i)=>({...s,score:stSc(i)})).sort((a,b)=>a.score-b.score).slice(0,3);const ap=prods();
    return(<div style={{maxWidth:860,margin:"0 auto",padding:"24px 20px"}}>
      <h1 style={{fontSize:26,fontWeight:700,color:"#f1f5f9",marginBottom:20}}>Funnel Health Report</h1>
      <div style={{display:"grid",gridTemplateColumns:"130px 1fr",gap:20,marginBottom:28,background:"#1e293b",borderRadius:12,padding:20,border:"1px solid #334155"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{position:"relative",width:90,height:90}}>
            <svg viewBox="0 0 90 90" style={{transform:"rotate(-90deg)"}}><circle cx="45" cy="45" r="38" fill="none" stroke="#334155" strokeWidth="5"/><circle cx="45" cy="45" r="38" fill="none" stroke={sc(o)} strokeWidth="5" strokeDasharray={`${o*2.388} 238.8`} strokeLinecap="round" style={{transition:"all .8s"}}/></svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:sc(o),fontFamily:M}}>{o}</div>
          </div>
        </div>
        <div><div style={{fontSize:18,fontWeight:700,color:sc(o),marginBottom:4}}>{o>=75?"Optimizing":o>=50?"Developing":o>=25?"Emerging":"Critical Gaps"}</div><p style={{color:"#94a3b8",fontSize:12,lineHeight:1.4}}>{o>=75?"Strong. Focus on analytics + expansion.":o>=50?"Core exists. Close gaps below.":o>=25?"Major gaps. Highest-impact fixes first.":"Fundamentals missing."}</p></div>
      </div>
      <div style={{marginBottom:28}}>
        {STAGES.map((stage,i)=>{const score=stSc(i);const isO=openSt===i;return(<div key={i}>
          <div onClick={()=>sos(isO?null:i)} style={{display:"grid",gridTemplateColumns:"90px 1fr 40px",gap:10,alignItems:"center",padding:"7px 10px",cursor:"pointer",borderRadius:5,background:isO?"#1e293b":"transparent",marginBottom:isO?0:2}}>
            <span style={{fontSize:10,color:"#cbd5e1",fontWeight:500}}>{stage.icon} {stage.short}</span>
            <div style={{height:16,background:"#0f172a",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${score}%`,background:`linear-gradient(90deg,${sc(score)}40,${sc(score)}80)`,borderRadius:3,transition:"width .5s"}}/></div>
            <span style={{fontSize:13,fontWeight:700,fontFamily:M,color:sc(score),textAlign:"right"}}>{score}</span>
          </div>
          {isO&&(<div style={{background:"#1e293b",borderRadius:"0 0 7px 7px",padding:"10px 12px",marginBottom:5,animation:"fu .15s ease"}}>
            {stage.prods.map((p,pi)=>(<div key={pi} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 9px",background:"#0f172a",borderRadius:5,marginBottom:3}}>
              <div><div style={{fontSize:11,fontWeight:600,color:"#e2e8f0"}}>{p.name}</div><div style={{fontSize:9,color:"#64748b"}}>{p.players.join(", ")}</div></div>
              <div style={{display:"flex",gap:2}}><span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:p.type==="buy"?"#3b82f615":"#8b5cf615",color:p.type==="buy"?"#60a5fa":"#a78bfa",fontFamily:M}}>{p.type}</span><span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:p.impact==="high"?"#22c55e15":"#eab30815",color:p.impact==="high"?"#22c55e":"#eab308",fontFamily:M}}>{p.impact}</span></div>
            </div>))}
          </div>)}
        </div>);})}
      </div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:M,fontSize:9,letterSpacing:2,color:"#ef4444",marginBottom:10}}>CRITICAL GAPS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {weak.map((w,i)=>(<div key={i} style={{background:"#1e293b",borderRadius:7,padding:12,borderLeft:`3px solid ${sc(w.score)}`}}>
            <div style={{fontSize:8,color:"#64748b",fontFamily:M}}>#{i+1}</div>
            <div style={{fontSize:11,fontWeight:600,color:"#f1f5f9",marginBottom:2}}>{w.label}</div>
            <div style={{fontSize:18,fontWeight:700,color:sc(w.score),fontFamily:M}}>{w.score}%</div>
          </div>))}
        </div>
      </div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:M,fontSize:9,letterSpacing:2,color:"#3b82f6",marginBottom:10}}>PRIORITY ROADMAP</div>
        {ap.slice(0,10).map((p,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"22px 1fr auto",gap:10,alignItems:"center",background:"#1e293b",borderRadius:5,padding:"8px 12px",marginBottom:4,border:"1px solid #334155"}}>
          <div style={{width:22,height:22,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:i<3?"#3b82f620":"#0f172a",fontSize:10,fontWeight:700,color:i<3?"#60a5fa":"#64748b",fontFamily:M}}>{i+1}</div>
          <div><div style={{fontSize:11,fontWeight:600,color:"#e2e8f0"}}>{p.name}</div><div style={{fontSize:9,color:"#64748b"}}>{p.stage} · Gap {100-p.stageScore}%</div></div>
          <span style={{fontSize:7,padding:"1px 5px",borderRadius:3,background:p.type==="buy"?"#3b82f615":"#8b5cf615",color:p.type==="buy"?"#60a5fa":"#a78bfa",fontFamily:M}}>{p.type}</span>
        </div>))}
      </div>
      <div style={{textAlign:"center",padding:"16px 0",borderTop:"1px solid #1e293b"}}>
        <button onClick={()=>setTab("map")} style={{padding:"7px 18px",borderRadius:5,border:"1px solid #334155",background:"transparent",color:"#94a3b8",cursor:"pointer",fontSize:11,marginRight:6}}>← Map</button>
        <button onClick={()=>{setAns({});sos(null);setTab("assess");}} style={{padding:"7px 18px",borderRadius:5,border:"1px solid #334155",background:"transparent",color:"#94a3b8",cursor:"pointer",fontSize:11}}>↻ Reset</button>
        <div style={{marginTop:12,fontSize:9,color:"#475569",fontFamily:M}}>MedView by Atelic.ai</div>
      </div>
    </div>);})()}

  </div>);
}
