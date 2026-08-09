/**
 * Seed sample undergraduates, companies, jobs, applications, and shortlists
 * for end-to-end profile / dashboard testing.
 *
 * Usage:
 *   npm run seed
 *   npx tsx scripts/seed-sample-data.ts
 *   npx tsx scripts/seed-sample-data.ts --reset   # delete previous seed data first
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import UndergradModel from "../src/lib/models/undergraduate";
import CompanyModel from "../src/lib/models/company";
import JobModel from "../src/lib/models/job";
import ApplicationModel from "../src/lib/models/application";
import ShortlistModel from "../src/lib/models/shortlist";

const SAMPLE_PASSWORD = "TestPass1!";
const DB_NAME = "careerly-ras";

const SEED_UNDERGRAD_EMAILS = [
  "kasun.perera@uom.lk",
  "nimali.silva@cmb.ac.lk",
  "ruwan.jayasuriya@pdn.ac.lk",
  "tharushi.fernando@sliit.lk",
  "amaya.wijesinghe@uom.lk",
];

const SEED_COMPANY_EMAILS = [
  "hr@technova.lk",
  "careers@lankadigital.lk",
  "jobs@greenbuild.lk",
  "talent@fincrest.lk",
];

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env");
  }
  await mongoose.connect(uri, { dbName: DB_NAME });
  console.log(`Connected to MongoDB (${DB_NAME})`);
}

async function resetSeedData() {
  console.log("Resetting previous seed data...");
  const undergrads = await UndergradModel.find({
    universityEmail: { $in: SEED_UNDERGRAD_EMAILS },
  }).select("_id");
  const companies = await CompanyModel.find({
    businessEmail: { $in: SEED_COMPANY_EMAILS },
  }).select("_id");

  const undergradIds = undergrads.map((u) => u._id);
  const companyIds = companies.map((c) => c._id);

  const jobs = await JobModel.find({ companyId: { $in: companyIds } }).select("_id");
  const jobIds = jobs.map((j) => j._id);

  await ApplicationModel.deleteMany({
    $or: [{ applicantId: { $in: undergradIds } }, { jobId: { $in: jobIds } }],
  });
  await ShortlistModel.deleteMany({
    $or: [
      { applicantId: { $in: undergradIds } },
      { companyId: { $in: companyIds } },
      { jobId: { $in: jobIds } },
    ],
  });
  await JobModel.deleteMany({ _id: { $in: jobIds } });
  await UndergradModel.deleteMany({ _id: { $in: undergradIds } });
  await CompanyModel.deleteMany({ _id: { $in: companyIds } });
  console.log("Previous seed data removed.");
}

async function seedCompanies(passwordHash: string) {
  const companies = [
    {
      companyName: "TechNova Solutions",
      registrationNumber: "SEED-REG-TN-001",
      businessEmail: "hr@technova.lk",
      password: passwordHash,
      phoneNumber: "+94771234001",
      industry: "Information Technology",
      companySize: "51-200",
      foundedYear: 2015,
      address: {
        street: "42 Bauddhaloka Mawatha",
        city: "Colombo",
        province: "Western",
        postalCode: "00700",
      },
      description:
        "TechNova builds cloud-native products for enterprises across South Asia. We hire interns and graduates into engineering, QA, and product teams.",
      website: "https://technova.example.lk",
      logoUrl: "",
      contactPerson: {
        name: "Sanjaya Rathnayake",
        designation: "Head of Talent",
        email: "sanjaya.r@technova.lk",
        phone: "+94771234002",
      },
      isEmailVerified: true,
      isVerified: true,
      isActive: true,
      verificationStatus: "approved",
      verificationPriority: "high",
      verifiedAt: new Date(),
      verificationDocuments: [
        {
          name: "Business Registration",
          url: "https://example.com/docs/technova-br.pdf",
          type: "business_registration",
          isRequired: true,
          isVerified: true,
          uploadedAt: new Date(),
        },
        {
          name: "Tax Certificate",
          url: "https://example.com/docs/technova-tax.pdf",
          type: "tax_certificate",
          isRequired: true,
          isVerified: true,
          uploadedAt: new Date(),
        },
      ],
      verificationNotes: [
        {
          note: "All documents verified. Approved for full access.",
          addedBy: "seed-admin",
          addedAt: new Date(),
        },
      ],
      jobPostingLimits: { maxActiveJobs: 20, currentActiveJobs: 0 },
      lastLogin: new Date(),
    },
    {
      companyName: "Lanka Digital Agency",
      registrationNumber: "SEED-REG-LD-002",
      businessEmail: "careers@lankadigital.lk",
      password: passwordHash,
      phoneNumber: "+94771234011",
      industry: "Marketing & Advertising",
      companySize: "11-50",
      foundedYear: 2018,
      address: {
        street: "15 Galle Road",
        city: "Colombo",
        province: "Western",
        postalCode: "00300",
      },
      description:
        "Full-service digital agency specializing in UX, brand strategy, and performance marketing for startups and NGOs.",
      website: "https://lankadigital.example.lk",
      contactPerson: {
        name: "Ishara Gunasekara",
        designation: "HR Manager",
        email: "ishara.g@lankadigital.lk",
        phone: "+94771234012",
      },
      isEmailVerified: true,
      isVerified: true,
      isActive: true,
      verificationStatus: "approved",
      verificationPriority: "medium",
      verifiedAt: new Date(),
      jobPostingLimits: { maxActiveJobs: 10, currentActiveJobs: 0 },
    },
    {
      companyName: "GreenBuild Engineering",
      registrationNumber: "SEED-REG-GB-003",
      businessEmail: "jobs@greenbuild.lk",
      password: passwordHash,
      phoneNumber: "+94771234021",
      industry: "Construction & Engineering",
      companySize: "201-500",
      foundedYear: 2008,
      address: {
        street: "88 Peradeniya Road",
        city: "Kandy",
        province: "Central",
        postalCode: "20000",
      },
      description:
        "Civil and structural engineering consultancy focused on sustainable infrastructure projects across Sri Lanka.",
      website: "https://greenbuild.example.lk",
      contactPerson: {
        name: "Chaminda Bandara",
        designation: "Recruitment Lead",
        email: "chaminda.b@greenbuild.lk",
        phone: "+94771234022",
      },
      isEmailVerified: true,
      isVerified: false,
      isActive: true,
      verificationStatus: "under_review",
      verificationPriority: "medium",
      verificationDocuments: [
        {
          name: "Incorporation Certificate",
          url: "https://example.com/docs/greenbuild-inc.pdf",
          type: "incorporation_certificate",
          isRequired: true,
          isVerified: false,
          uploadedAt: new Date(),
        },
      ],
      verificationNotes: [
        {
          note: "Awaiting tax certificate upload.",
          addedBy: "seed-admin",
          addedAt: new Date(),
        },
      ],
      jobPostingLimits: { maxActiveJobs: 15, currentActiveJobs: 0 },
    },
    {
      companyName: "FinCrest Analytics",
      registrationNumber: "SEED-REG-FC-004",
      businessEmail: "talent@fincrest.lk",
      password: passwordHash,
      phoneNumber: "+94771234031",
      industry: "Finance & FinTech",
      companySize: "51-200",
      foundedYear: 2019,
      address: {
        street: "7 Independence Avenue",
        city: "Colombo",
        province: "Western",
        postalCode: "00700",
      },
      description:
        "FinCrest builds risk analytics and payments tooling for banks and insurers in emerging markets.",
      website: "https://fincrest.example.lk",
      contactPerson: {
        name: "Dilini Jayawardena",
        designation: "People Partner",
        email: "dilini.j@fincrest.lk",
        phone: "+94771234032",
      },
      isEmailVerified: true,
      isVerified: false,
      isActive: true,
      verificationStatus: "pending",
      verificationPriority: "low",
      jobPostingLimits: { maxActiveJobs: 10, currentActiveJobs: 0 },
    },
  ];

  const created = [];
  for (const data of companies) {
    const doc = await CompanyModel.findOneAndUpdate(
      { businessEmail: data.businessEmail },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created.push(doc);
  }
  console.log(`Seeded ${created.length} companies`);
  return created;
}

async function seedUndergrads(passwordHash: string) {
  const undergrads = [
    {
      index: "210001A",
      name: "Kasun Perera",
      nameWithInitials: "K. Perera",
      universityEmail: "kasun.perera@uom.lk",
      password: passwordHash,
      isVerified: true,
      batch: "21",
      education: {
        faculty: "Faculty of Engineering",
        degreeProgramme: "BSc Engineering (Hons) Computer Science & Engineering",
      },
      birthdate: new Date("2001-03-14"),
      address: "12 Temple Road, Nugegoda",
      phoneNumber: "0771234001",
      skills: ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "Git"],
      jobSearchingStatus: "active",
      cvUrl: "https://example.com/cvs/kasun-perera-cv.pdf",
      resumeUrl: "https://example.com/cvs/kasun-perera-resume.pdf",
      profilePicUrl: "",
      lastLogin: new Date(),
    },
    {
      index: "210045B",
      name: "Nimali Silva",
      nameWithInitials: "N. Silva",
      universityEmail: "nimali.silva@cmb.ac.lk",
      password: passwordHash,
      isVerified: true,
      batch: "20",
      education: {
        faculty: "Faculty of Business",
        degreeProgramme: "Bachelor of Business Science Honours",
      },
      birthdate: new Date("2000-07-22"),
      address: "45 Flower Road, Colombo 07",
      phoneNumber: "0771234002",
      skills: ["Excel", "Financial Modeling", "Power BI", "Communication", "SQL"],
      jobSearchingStatus: "passive",
      cvUrl: "https://example.com/cvs/nimali-silva-cv.pdf",
      resumeUrl: null,
      lastLogin: new Date(),
    },
    {
      index: "200112C",
      name: "Ruwan Jayasuriya",
      nameWithInitials: "R. Jayasuriya",
      universityEmail: "ruwan.jayasuriya@pdn.ac.lk",
      password: passwordHash,
      isVerified: true,
      batch: "20",
      education: {
        faculty: "Faculty of Engineering",
        degreeProgramme: "BSc Engineering (Hons) Civil Engineering",
      },
      birthdate: new Date("2000-11-05"),
      address: "9 Peradeniya Road, Kandy",
      phoneNumber: "0771234003",
      skills: ["AutoCAD", "Revit", "Project Management", "Structural Analysis"],
      jobSearchingStatus: "active",
      cvUrl: "https://example.com/cvs/ruwan-jayasuriya-cv.pdf",
      resumeUrl: "https://example.com/cvs/ruwan-jayasuriya-resume.pdf",
    },
    {
      index: "220088D",
      name: "Tharushi Fernando",
      nameWithInitials: "T. Fernando",
      universityEmail: "tharushi.fernando@sliit.lk",
      password: passwordHash,
      isVerified: true,
      batch: "22",
      education: {
        faculty: "Faculty of Information Technology",
        degreeProgramme: "BSc (Hons) Information Technology",
      },
      birthdate: new Date("2002-01-18"),
      address: "33 High Level Road, Maharagama",
      phoneNumber: "0771234004",
      skills: ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
      jobSearchingStatus: "active",
      cvUrl: "https://example.com/cvs/tharushi-fernando-cv.pdf",
      resumeUrl: "https://example.com/cvs/tharushi-fernando-resume.pdf",
    },
    {
      index: "210099E",
      name: "Amaya Wijesinghe",
      nameWithInitials: "A. Wijesinghe",
      universityEmail: "amaya.wijesinghe@uom.lk",
      password: passwordHash,
      isVerified: false, // incomplete / unverified profile case
      batch: "21",
      education: {
        faculty: "Faculty of Architecture",
        degreeProgramme: "Bachelor of Design Honours",
      },
      birthdate: new Date("2001-09-30"),
      address: "21 Marine Drive, Mount Lavinia",
      phoneNumber: "0771234005",
      skills: [],
      jobSearchingStatus: "not_searching",
      cvUrl: null,
      resumeUrl: null,
    },
  ];

  const created = [];
  for (const data of undergrads) {
    const doc = await UndergradModel.findOneAndUpdate(
      { universityEmail: data.universityEmail },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created.push(doc);
  }
  console.log(`Seeded ${created.length} undergraduates`);
  return created;
}

async function seedJobs(companies: any[]) {
  const [techNova, lankaDigital, greenBuild, finCrest] = companies;

  const jobs = [
    {
      title: "Software Engineering Intern",
      description:
        "Join TechNova's product team to build APIs and React dashboards for enterprise clients. Mentorship included.",
      jobType: "Internship",
      category: "Information Technology",
      workPlaceType: "Hybrid",
      location: "Colombo",
      salaryRange: { min: 40000, max: 60000 },
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      urgent: true,
      qualifiedDegrees: [
        "BSc Engineering (Hons) Computer Science & Engineering",
        "BSc (Hons) Information Technology",
        "BSc (Hons) Artificial Intelligence",
      ],
      skillsRequired: ["JavaScript", "React", "Node.js", "Git"],
      customSections: [
        {
          title: "What you'll do",
          bulletPoints: [
            "Ship features in an agile squad",
            "Write tests and documentation",
            "Pair with senior engineers weekly",
          ],
        },
        {
          title: "Nice to have",
          bulletPoints: ["TypeScript", "MongoDB", "Docker"],
        },
      ],
      companyId: techNova._id,
      status: "active",
      applicantsCount: 0,
    },
    {
      title: "Full-stack Developer (Graduate)",
      description:
        "Full-time graduate role building customer-facing web apps. Strong fundamentals preferred over years of experience.",
      jobType: "Full-time",
      category: "Information Technology",
      workPlaceType: "On-site",
      location: "Colombo",
      salaryRange: { min: 120000, max: 180000 },
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      urgent: false,
      qualifiedDegrees: [
        "BSc Engineering (Hons) Computer Science & Engineering",
        "BSc (Hons) Information Technology",
        "BSc (Hons) Information Technology & Management",
      ],
      skillsRequired: ["TypeScript", "React", "Node.js", "SQL"],
      companyId: techNova._id,
      status: "active",
      applicantsCount: 0,
    },
    {
      title: "Digital Marketing Intern",
      description:
        "Support campaign planning, analytics reporting, and content calendars for Lanka Digital Agency clients.",
      jobType: "Internship",
      category: "Business",
      workPlaceType: "Hybrid",
      location: "Colombo",
      salaryRange: { min: 35000, max: 50000 },
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      urgent: true,
      qualifiedDegrees: ["Bachelor of Business Science Honours"],
      skillsRequired: ["Excel", "Communication", "Social Media"],
      companyId: lankaDigital._id,
      status: "active",
      applicantsCount: 0,
    },
    {
      title: "Junior Civil Engineer Intern",
      description:
        "Assist site engineers with drawings, quantity take-offs, and site documentation for GreenBuild projects.",
      jobType: "Internship",
      category: "Engineering",
      workPlaceType: "On-site",
      location: "Kandy",
      salaryRange: { min: 45000, max: 65000 },
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40),
      urgent: false,
      qualifiedDegrees: ["BSc Engineering (Hons) Civil Engineering"],
      skillsRequired: ["AutoCAD", "MS Office"],
      companyId: greenBuild._id,
      status: "active",
      applicantsCount: 0,
    },
    {
      title: "Data Analyst Intern",
      description:
        "Work with FinCrest analytics team on dashboards, SQL queries, and risk reporting prototypes.",
      jobType: "Internship",
      category: "Information Technology",
      workPlaceType: "Remote",
      location: "Remote",
      salaryRange: { min: 50000, max: 70000 },
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 50),
      urgent: true,
      qualifiedDegrees: [
        "BSc Engineering (Hons) Computer Science & Engineering",
        "BSc (Hons) Information Technology",
        "Bachelor of Business Science Honours",
      ],
      skillsRequired: ["Python", "SQL", "Excel"],
      companyId: finCrest._id,
      status: "active",
      applicantsCount: 0,
    },
  ];

  const created = [];
  for (const data of jobs) {
    // Idempotent-ish: match by title + company
    let doc = await JobModel.findOne({ title: data.title, companyId: data.companyId });
    if (doc) {
      Object.assign(doc, data);
      await doc.save();
    } else {
      doc = await JobModel.create(data);
    }
    created.push(doc);
  }

  // Update company active job counts
  for (const company of companies) {
    const count = await JobModel.countDocuments({
      companyId: company._id,
      status: "active",
    });
    company.jobPostingLimits = company.jobPostingLimits || {};
    company.jobPostingLimits.currentActiveJobs = count;
    await company.save();
  }

  console.log(`Seeded ${created.length} jobs`);
  return created;
}

async function seedApplicationsAndRelations(
  undergrads: any[],
  companies: any[],
  jobs: any[]
) {
  const [kasun, nimali, ruwan, tharushi] = undergrads;
  const [techNova, lankaDigital, greenBuild] = companies;
  const [seIntern, fullStack, marketingIntern, civilIntern, dataIntern] = jobs;

  // Saved jobs for undergrads
  kasun.savedJobs = [
    { jobId: seIntern._id, savedAt: new Date() },
    { jobId: fullStack._id, savedAt: new Date() },
    { jobId: dataIntern._id, savedAt: new Date() },
  ];
  await kasun.save();

  tharushi.savedJobs = [
    { jobId: seIntern._id, savedAt: new Date() },
    { jobId: dataIntern._id, savedAt: new Date() },
  ];
  await tharushi.save();

  nimali.savedJobs = [{ jobId: marketingIntern._id, savedAt: new Date() }];
  await nimali.save();

  const applicationDefs = [
    {
      jobId: seIntern._id,
      applicantId: kasun._id,
      applicantDegree: kasun.education.degreeProgramme,
      cv: kasun.cvUrl,
      coverLetter:
        "I am excited to apply for the Software Engineering Intern role at TechNova. I have built several full-stack projects with React and Node.js.",
      specialRequirements: "Available to start immediately.",
      skills: kasun.skills,
      status: "applied",
    },
    {
      jobId: fullStack._id,
      applicantId: kasun._id,
      applicantDegree: kasun.education.degreeProgramme,
      cv: kasun.cvUrl,
      coverLetter:
        "Please consider my application for the graduate Full-stack Developer position. Open to on-site work in Colombo.",
      skills: kasun.skills,
      status: "shortlisted",
    },
    {
      jobId: dataIntern._id,
      applicantId: tharushi._id,
      applicantDegree: tharushi.education.degreeProgramme,
      cv: tharushi.cvUrl,
      coverLetter:
        "My Python and SQL coursework align well with FinCrest's Data Analyst Intern role.",
      skills: tharushi.skills,
      status: "interview_called",
      interviewCall: {
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        time: "10:00 AM",
        location: "Zoom - link will be emailed",
      },
    },
    {
      jobId: marketingIntern._id,
      applicantId: nimali._id,
      applicantDegree: nimali.education.degreeProgramme,
      cv: nimali.cvUrl,
      coverLetter:
        "I would love to contribute to Lanka Digital's campaign and analytics work as a Digital Marketing Intern.",
      skills: nimali.skills,
      status: "selected",
    },
    {
      jobId: civilIntern._id,
      applicantId: ruwan._id,
      applicantDegree: ruwan.education.degreeProgramme,
      cv: ruwan.cvUrl,
      coverLetter:
        "I am applying for the Junior Civil Engineer Intern role and can relocate to Kandy for the internship period.",
      skills: ruwan.skills,
      status: "applied",
    },
    {
      jobId: seIntern._id,
      applicantId: tharushi._id,
      applicantDegree: tharushi.education.degreeProgramme,
      cv: tharushi.cvUrl,
      coverLetter: "Interested in the Software Engineering Intern position at TechNova.",
      skills: tharushi.skills,
      status: "rejected",
    },
  ];

  const applications = [];
  for (const def of applicationDefs) {
    let app = await ApplicationModel.findOne({
      jobId: def.jobId,
      applicantId: def.applicantId,
    });
    if (app) {
      Object.assign(app, def);
      await app.save();
    } else {
      app = await ApplicationModel.create(def);
    }
    applications.push(app);
  }

  // Update applicantsCount on jobs
  for (const job of jobs) {
    const count = await ApplicationModel.countDocuments({ jobId: job._id });
    job.applicantsCount = count;
    await job.save();
  }

  // Shortlists for shortlisted / selected apps
  const shortlistTargets = applications.filter((a) =>
    ["shortlisted", "interview_called", "selected"].includes(a.status)
  );

  for (const app of shortlistTargets) {
    const job = jobs.find((j) => String(j._id) === String(app.jobId));
    if (!job?.companyId) continue;
    const company = companies.find((c) => String(c._id) === String(job.companyId));
    await ShortlistModel.findOneAndUpdate(
      { applicationId: app._id },
      {
        $set: {
          jobId: app.jobId,
          applicantId: app.applicantId,
          applicationId: app._id,
          companyId: job.companyId,
          shortlistedBy: company?.businessEmail || "seed",
          shortlistedAt: new Date(),
          notes: "Seeded shortlist for testing company shortlist / selected views",
          priority: app.status === "selected" ? "high" : "medium",
        },
      },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${applications.length} applications + shortlists`);
  return applications;
}

function printCredentials() {
  console.log("\n========== SEED LOGIN CREDENTIALS ==========");
  console.log(`Password for all seeded accounts: ${SAMPLE_PASSWORD}\n`);

  console.log("Undergraduates (login at /auth/undergrad/login):");
  console.log("  kasun.perera@uom.lk          — CSE, active seeker, CV+skills, apps+saved jobs");
  console.log("  nimali.silva@cmb.ac.lk        — Business, passive, marketing application");
  console.log("  ruwan.jayasuriya@pdn.ac.lk    — Civil Eng, active, civil internship app");
  console.log("  tharushi.fernando@sliit.lk    — IT, active, interview_called + rejected apps");
  console.log("  amaya.wijesinghe@uom.lk       — Design, unverified, empty skills/CV\n");

  console.log("Companies (login at /auth/company/login):");
  console.log("  hr@technova.lk               — verified/approved, multiple jobs + applicants");
  console.log("  careers@lankadigital.lk      — verified/approved, marketing job");
  console.log("  jobs@greenbuild.lk           — under_review, civil job");
  console.log("  talent@fincrest.lk           — pending verification, data intern job");
  console.log("============================================\n");
}

async function main() {
  const shouldReset = process.argv.includes("--reset");
  await connectDb();

  if (shouldReset) {
    await resetSeedData();
  }

  const passwordHash = await hash(SAMPLE_PASSWORD);
  const companies = await seedCompanies(passwordHash);
  const undergrads = await seedUndergrads(passwordHash);
  const jobs = await seedJobs(companies);
  await seedApplicationsAndRelations(undergrads, companies, jobs);

  printCredentials();
  await mongoose.disconnect();
  console.log("Seed complete.");
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
