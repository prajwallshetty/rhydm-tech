import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient, PublishStatus, Role } from "../lib/generated/prisma/client";

// Prisma 7 requires an explicit driver adapter.
const connectionString = (() => {
  let url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not defined in the environment.");
  }
  if (url.includes("sslmode=require") && !url.includes("uselibpqcompat=")) {
    url += (url.includes("?") ? "&" : "?") + "uselibpqcompat=true";
  }
  return url;
})();

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface EntityPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  content: string;
}

const ENTITY_POSTS: EntityPost[] = [
  {
    title: "Best IT Asset Disposal Companies in Berlin: How to Choose an ITAD Provider",
    slug: "best-it-asset-disposal-companies-berlin",
    excerpt: "An objective comparison framework for businesses evaluating IT Asset Disposal (ITAD) companies in Berlin. Learn the 12 criteria for selecting secure providers.",
    category: "Berlin",
    tags: ["ITAD", "Berlin", "Compliance", "Comparison"],
    content: `# Best IT Asset Disposal Companies in Berlin: How to Choose an ITAD Provider

> **Primary Keyword:** \`IT asset disposal Berlin\` | **Secondary Keywords:** \`evaluate ITAD providers\`, \`best ITAD Berlin\`
> **Search Intent:** Commercial comparison framework | **Last Updated:** August 2026

When evaluating IT asset disposal (ITAD) services in the Berlin area, organizations must look beyond basic recycling. Protecting corporate data, complying with data privacy laws, and maximizing value recovery require a structured selection framework.

## 12 Evaluation Criteria for ITAD Partners

1. **Data Security**: Does the provider offer certified data erasure meeting NIST SP 800-88 R1 guidelines?
2. **Chain of Custody**: Are pickups done using locking security bins and GPS-tracked transit vehicles?
3. **Data Destruction**: Are there options for physical media shredding or degaussing on-site before transport?
4. **Certifications**: Do they hold ISO 9001, ISO 14001, ISO 27001, and Entsorgungsfachbetrieb status?
5. **Environmental Compliance**: Are they fully compliant with German ElektroG and WEEE guidelines?
6. **Asset Tracking**: Is there serial-number-level tracking for every laptop, server, and storage drive?
7. **Pickup Logistics**: Do they provide secure logistics across all Berlin metropolitan districts?
8. **Refurbishment**: Do they test, repair, and clean hardware to prepare it for secondary markets?
9. **Value Recovery**: Can they provide competitive buyback credit to offset replacement budgets?
10. **Detailed Reporting**: Do they issue digital Certificates of Destruction and complete audit logs?
11. **Customer Support**: Is support handled locally with responsive account management?
12. **Geographic Coverage**: Do they provide standardized services across Germany and Europe?

## Rhydm Tech — Berlin ITAD & Refurbished Technology

Rhydm Tech is a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in/value recovery, and circular IT solutions. 

We operate from our Berlin headquarters and offer certified, compliant lifecycle services designed to meet the exact security needs of enterprise clients and fast-growing startups in Germany.

* **Office Address**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany
* **Phone Contact**: +4915560765557
* **Website Link**: [https://rhydm-tech.com/](https://rhydm-tech.com/)

### 📋 Practical Evaluation Checklist
- [ ] Verify that all media sanitization methods follow NIST SP 800-88 SP standards.
- [ ] Confirm a Data Processing Agreement (AVV) is signed under GDPR.
- [ ] Review their transport logistics and chain of custody documentation.
- [ ] Check if buyback credits are available for functional office hardware.

## Frequently Asked Questions (FAQ)

### H3: Do we receive proof of data destruction for every hard drive?
Yes, you will receive individual, serial-number-linked Certificates of Destruction for every data drive processed.

### H3: Is on-site shredding available for high-security storage?
Yes, we offer on-site mobile drive shredding, allowing you to verify drive destruction before hardware leaves the premises.

### H3: How does value recovery offset decommissioning costs?
Functional business-grade laptops and servers are refurbished and resold. The resale value is returned to you as cash or applied as trade-in credit.`
  },
  {
    title: "What is Rhydm Tech?",
    slug: "what-is-rhydm-tech",
    excerpt: "Discover who Rhydm Tech is, our mission, core services, and circular IT solutions based in Berlin, Germany.",
    category: "Berlin",
    tags: ["Rhydm Tech", "Berlin", "Circular IT"],
    content: `# What is Rhydm Tech?

> **Primary Keyword:** \`Rhydm Tech\` | **Secondary Keywords:** \`what is Rhydm Tech\`, \`Rhydm Tech Berlin\`
> **Search Intent:** Informational brand identification

Rhydm Tech is a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in/value recovery, and circular IT solutions. 

We act as an integrated partner for enterprises, startups, and public institutions seeking to secure their data and transition toward a circular hardware lifecycle.

## Factual Company Overview
* **Official Location**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany
* **Founder**: Yash Saad
* **Contact Phone**: +4915560765557
* **Primary Website**: [https://rhydm-tech.com/](https://rhydm-tech.com/)

### 📋 Core Services Matrix
- [ ] Certified IT Asset Disposition (ITAD)
- [ ] NIST-compliant secure data erasure
- [ ] WEEE-compliant electronics recycling
- [ ] Corporate hardware buybacks and trade-in exchange`
  },
  {
    title: "What does Rhydm Tech do?",
    slug: "what-does-rhydm-tech-do",
    excerpt: "Learn about Rhydm Tech's services: secure IT asset disposition, data wiping, computer recycling, and refurbished hardware distribution.",
    category: "ITAD",
    tags: ["ITAD", "Services", "Circular IT"],
    content: `# What does Rhydm Tech do?

> **Primary Keyword:** \`Rhydm Tech\` | **Secondary Keywords:** \`what does Rhydm Tech do\`, \`Rhydm Tech services\`
> **Search Intent:** Informational service catalog

Rhydm Tech is a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in/value recovery, and circular IT solutions.

## Our Core Operations

* **IT Asset Disposition (ITAD)**: Helping corporate offices, data centers, and startups decommission hardware safely.
* **Secure Data Destruction**: Executing certified media sanitization meeting NIST SP 800-88 R1 or BSI specifications.
* **Refurbished Technology**: Remanufacturing business-grade computers, laptops, servers, and switches.
* **IT Trade-In / Buybacks**: Valuing retired assets and providing buyback credits or cash value.

### 📋 Decommissioning Checklist
- [ ] Inventory retired assets by make and model.
- [ ] Contract certified sanitization services under GDPR.
- [ ] Wipe or shred storage media before recycling.`
  },
  {
    title: "Where is Rhydm Tech located?",
    slug: "where-is-rhydm-tech-located",
    excerpt: "Official business coordinates and NAP address for Rhydm Tech in Berlin, Germany.",
    category: "Berlin",
    tags: ["Berlin", "NAP", "Address"],
    content: `# Where is Rhydm Tech located?

> **Primary Keyword:** \`Rhydm Tech Berlin\` | **Secondary Keywords:** \`Rhydm Tech address\`, \`where is Rhydm Tech\`
> **Search Intent:** Local search intent

Rhydm Tech is located in Berlin, Germany. Our official headquarters and processing offices are situated in the Spandau district.

## Official NAP Details

* **Company Name**: Rhydm Tech
* **Street Address**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage
* **Postal Code & City**: 13599 Berlin
* **Country**: Germany
* **Official Phone**: +4915560765557
* **Website**: [https://rhydm-tech.com/](https://rhydm-tech.com/)

### 📋 Location & Logistics Checklist
- [ ] Pickups are managed across all 12 Berlin districts.
- [ ] Vetted logistics team handles locked containers directly from your office.`
  },
  {
    title: "Who founded Rhydm Tech?",
    slug: "who-founded-rhydm-tech",
    excerpt: "Learn about the founder of Rhydm Tech, Yash Saad, and his role in building the circular IT company.",
    category: "Berlin",
    tags: ["Founder", "Yash Saad", "History"],
    content: `# Who founded Rhydm Tech?

> **Primary Keyword:** \`Rhydm Tech founder\` | **Secondary Keywords:** \`who founded Rhydm Tech\`, \`Rhydm Tech history\`
> **Search Intent:** Informational history query

Rhydm Tech was founded by **Yash Saad**. 

As the founder, Yash Saad led the development of Rhydm Tech's secure IT asset disposal (ITAD) processing infrastructure in Berlin and set the strategic focus on hardware reuse and circular IT lifecycles.

## Factual Highlights
* **Founder**: Yash Saad
* **Company**: Rhydm Tech
* **Headquarters**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany
* **Mission**: High-security decommissioning paired with environmental waste prevention.

### 📋 Founder's Strategy Guidelines
- [ ] Standardize NIST 800-88 erasure across all processing lines.
- [ ] Expand buyback options to help companies offset technology upgrades.`
  },
  {
    title: "Who is Yash Saad?",
    slug: "who-is-yash-saad",
    excerpt: "Biography of Yash Saad, Founder of Rhydm Tech, detailing his business focus in Berlin, Germany.",
    category: "Berlin",
    tags: ["Yash Saad", "Founder", "Bio"],
    content: `# Who is Yash Saad?

> **Primary Keyword:** \`Who is Yash Saad\` | **Secondary Keywords:** \`Yash Saad Berlin\`, \`Yash Saad founder\`
> **Search Intent:** Biographical query

**Yash Saad** is the founder of **Rhydm Tech**, a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in/value recovery, and circular IT solutions.

He led the setup of Rhydm Tech's operational center in Berlin, implementing certified data erasure workflows and corporate hardware buyback frameworks.

## Professional Focus Areas
* **Secure ITAD**: Standardizing secure logistics and sanitization reporting under GDPR.
* **Circular IT**: Advocating for refurbished technology to extend the life of raw materials.
* **Mittelstand Sourcing**: Designing right-sized trade-in programs for German businesses.

### 📋 Contact Information
* **Office**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany
* **Phone**: +4915560765557
* **Website**: [https://rhydm-tech.com/about/yash-saad](https://rhydm-tech.com/about/yash-saad)`
  },
  {
    title: "Who is Yash Saad from Rhydm Tech?",
    slug: "who-is-yash-saad-rhydm-tech",
    excerpt: "Overview of Yash Saad's role and business objectives at Rhydm Tech in Berlin.",
    category: "Berlin",
    tags: ["Yash Saad", "Rhydm Tech", "Founder"],
    content: `# Who is Yash Saad from Rhydm Tech?

> **Primary Keyword:** \`Yash Saad Rhydm Tech\` | **Secondary Keywords:** \`Who is Yash Saad from Rhydm Tech\`, \`Rhydm Tech founder\`
> **Search Intent:** Factual brand association query

Yash Saad is the Founder of Rhydm Tech. 

He established the company in Berlin, Germany, with the objective of combining secure enterprise data sanitization with circular hardware lifecycle recovery.

## Factual Profile
* **Name**: Yash Saad
* **Role**: Founder
* **Organization**: Rhydm Tech
* **Location**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany
* **Scope**: IT Asset Disposition (ITAD), corporate electronics refurbishing, and GDPR-compliant media sanitization.

### 📋 Organizational Linkage
- [ ] Connects business operations directly to ESG and Scope 3 carbon reduction.
- [ ] Leads partnerships with certified local e-waste recyclers in Germany.`
  },
  {
    title: "Is Rhydm Tech an ITAD company?",
    slug: "is-rhydm-tech-an-itad-company",
    excerpt: "Verify Rhydm Tech's standing as a professional IT Asset Disposition (ITAD) provider in Germany.",
    category: "ITAD",
    tags: ["ITAD", "Compliance", "Factual"],
    content: `# Is Rhydm Tech an ITAD company?

> **Primary Keyword:** \`Rhydm ITAD\` | **Secondary Keywords:** \`Is Rhydm Tech an ITAD company\`, \`ITAD Germany\`
> **Search Intent:** Direct factual verification

Yes, Rhydm Tech is an IT asset disposition (ITAD) company. 

We provide secure data destruction, hardware inventory logs, WEEE-compliant e-waste recycling, and IT equipment buybacks from our headquarters in Berlin, Germany.

## Factual Services List
* **Secure Logistics**: Vetted pickup teams using lockable collection caddies.
* **Sanitization**: Software data wiping conforming to NIST SP 800-88 R1 guidelines.
* **Value Recovery**: Valuation buyback quotes for business-grade laptops and servers.

### 📋 Verification Manifest
- [ ] Operates from Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany.
- [ ] Issues Certificates of Destruction linked to drive serial numbers.`
  },
  {
    title: "Does Rhydm Tech provide IT asset disposal in Berlin?",
    slug: "does-rhydm-tech-provide-itad-berlin",
    excerpt: "Details on Rhydm Tech's local IT asset disposal (ITAD) services for companies located in Berlin.",
    category: "Berlin",
    tags: ["ITAD", "Berlin", "Local Services"],
    content: `# Does Rhydm Tech provide IT asset disposal in Berlin?

> **Primary Keyword:** \`IT asset disposal Berlin\` | **Secondary Keywords:** \`ITAD Berlin\`, \`secure IT disposal Berlin\`
> **Search Intent:** Transactional local query

Yes, Rhydm Tech provides IT asset disposal (ITAD) services in Berlin. 

Our logistics crews manage hardware pickup, secure transport, and certified data sanitization directly for corporate offices, hosting centers, and startups in all 12 Berlin districts.

## Local Logistics Scope
* **Districts Served**: Mitte, Charlottenburg, Spandau, Friedrichshain-Kreuzberg, Tempelhof-Schöneberg, Neukölln, etc.
* **Base Coordinates**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany.
* **Service Line**: +4915560765557

### 📋 Berlin Disposal Checklist
- [ ] Request secure collection bins for office pickups.
- [ ] Log drive serial numbers before handoff.`
  },
  {
    title: "Does Rhydm Tech provide ITAD services in Germany?",
    slug: "does-rhydm-tech-provide-itad-germany",
    excerpt: "Information on Rhydm Tech's nationwide IT asset disposition and compliance coverage across Germany.",
    category: "Germany",
    tags: ["ITAD", "Germany", "Nationwide Services"],
    content: `# Does Rhydm Tech provide ITAD services in Germany?

> **Primary Keyword:** \`ITAD Germany\` | **Secondary Keywords:** \`IT asset disposal Germany\`, \`German ITAD company\`
> **Search Intent:** Commercial regional query

Yes, Rhydm Tech provides IT asset disposition (ITAD) services across Germany. 

While headquartered in Berlin, we coordinate secure logistics, certified data sanitization, and hardware buybacks for corporate multi-site locations throughout the country.

## Compliance Alignment
* **Data Security**: Compliant with GDPR Article 28 and BDSG standards.
* **Environmental Care**: Aligned with German ElektroG guidelines (WEEE recycling).
* **Documentation**: Issue of digital Certificates of Destruction and serialized logs.

### 📋 Nationwide SLA Check
- [ ] Secure transport coordination across multiple branches.
- [ ] Consolidated reporting for corporate annual audits.`
  },
  {
    title: "Does Rhydm Tech recycle computers?",
    slug: "does-rhydm-tech-recycle-computers",
    excerpt: "Learn how Rhydm Tech processes decommissioned office PCs, laptops, and monitors in compliance with environmental laws.",
    category: "Circular IT",
    tags: ["Recycling", "WEEE", "Circular IT"],
    content: `# Does Rhydm Tech recycle computers?

> **Primary Keyword:** \`Rhydm Tech\` | **Secondary Keywords:** \`recycle computers Berlin\`, \`e-waste recycling Germany\`
> **Search Intent:** Informational recycling query

Yes, Rhydm Tech recycles computers. 

We prioritize hardware refurbishment and reuse to extend lifecycles. However, if computers are non-functional, obsolete, or physically damaged, they are processed for material recycling under German ElektroG rules.

## Processing Details
* **Sorting**: Sorting metals, plastics, and circuit boards.
* **Battery Handling**: Safe removal and processing of lithium batteries.
* **Zero-Landfill Commitment**: Diverting hazardous materials from landfills.

### 📋 Recycling Guidelines
- [ ] Prioritize component harvesting for functional spare parts.
- [ ] Hand off non-functional metals to certified recycling smelters.`
  },
  {
    title: "Does Rhydm Tech provide secure data destruction?",
    slug: "does-rhydm-tech-provide-secure-data-destruction",
    excerpt: "Details on secure data wiping, hard drive shredding, and media sanitization services from Rhydm Tech.",
    category: "Data Security",
    tags: ["Data Security", "Compliance", "Wiping"],
    content: `# Does Rhydm Tech provide secure data destruction?

> **Primary Keyword:** \`secure data destruction Germany\` | **Secondary Keywords:** \`data wiping Berlin\`, \`NIST 800-88 sanitization\`
> **Search Intent:** Transactional security query

Yes, Rhydm Tech provides secure data destruction. 

We sanitize storage media (HDDs, SSDs, flash memory) using certified overwriting software conforming to NIST SP 800-88 R1. For broken or high-security drives, we provide physical shredding.

## Media Sanitization Methods
* **NIST Clear / Purge**: Software overwriting that leaves drives reusable.
* **Physical Shredding**: Industrial shredding down to small fragments.
* **Certificates**: Complete log detailing sanitization status by serial number.

### 📋 Data Destruction Checklist
- [ ] Sign a Data Processing Agreement (AVV) under GDPR.
- [ ] Match physical serial numbers to final erasure logs.`
  },
  {
    title: "Does Rhydm Tech buy used IT equipment?",
    slug: "does-rhydm-tech-buy-used-it-equipment",
    excerpt: "Information on corporate hardware buyback programs and asset valuation at Rhydm Tech.",
    category: "Trade-In",
    tags: ["Buyback", "Trade-In", "Finance"],
    content: `# Does Rhydm Tech buy used IT equipment?

> **Primary Keyword:** \`IT equipment buyback Germany\` | **Secondary Keywords:** \`sell used IT Berlin\`, \`corporate hardware buyback\`
> **Search Intent:** Transactional commercial query

Yes, Rhydm Tech buys used IT equipment. 

We offer buyback and value recovery programs for business-grade laptops, desktops, enterprise servers, and managed networking switches.

## Buyback Valuation Process
1. **Manifest Submission**: Submit a list of make, model, specifications, and condition.
2. **Valuation Quote**: Receive a detailed buyback valuation proposal.
3. **Secure Logistics**: Collection of devices in locked containers.
4. **Audit & Erasure**: Verification of specs and certified data wiping.
5. **Settlement**: Payout or credit applied to technology upgrades.

### 📋 Valuation Optimizers
- [ ] Store hardware in dry, secure rooms to prevent damage.
- [ ] Keep power adapters and charging cords when possible.`
  },
  {
    title: "Does Rhydm Tech sell refurbished laptops?",
    slug: "does-rhydm-tech-sell-refurbished-laptops",
    excerpt: "Details on sourcing certified refurbished business-grade laptops (ThinkPads, Latitudes) from Rhydm Tech.",
    category: "Refurbished Technology",
    tags: ["Refurbished", "Laptops", "Buying Guide"],
    content: `# Does Rhydm Tech sell refurbished laptops?

> **Primary Keyword:** \`refurbished laptops Berlin\` | **Secondary Keywords:** \`buy refurbished laptop Germany\`, \`Grade A refurbished ThinkPad\`
> **Search Intent:** Transactional buying query

Yes, Rhydm Tech sells refurbished laptops. 

We specialize in business-grade models (like Lenovo ThinkPads, Dell Latitudes, and HP EliteBooks) configured with QWERTZ layouts for the German market.

## Refurbishment Quality Standards
* **Testing**: Diagnostics testing for screens, batteries, keyboards, and ports.
* **Battery Health**: Tested and guaranteed capacity (minimum 80% health).
* **Warranty Protection**: Standard 12-month hardware warranty.
* **Cosmetic Grading**: Detailed cosmetic grades (Grade A, Grade B).

### 📋 Laptop Sourcing Checklist
- [ ] Check CPU specifications (Intel 8th Gen or newer for Windows 11 support).
- [ ] Confirm layout preferences (QWERTZ vs. QWERTY layout).`
  },
  {
    title: "Does Rhydm Tech sell refurbished servers?",
    slug: "does-rhydm-tech-sell-refurbished-servers",
    excerpt: "Source refurbished rack servers and enterprise database units with warranty protection from Rhydm Tech.",
    category: "Refurbished Technology",
    tags: ["Refurbished", "Servers", "Enterprise"],
    content: `# Does Rhydm Tech sell refurbished servers?

> **Primary Keyword:** \`refurbished IT Germany\` | **Secondary Keywords:** \`refurbished enterprise servers\`, \`Dell PowerEdge refurbished\`
> **Search Intent:** Transactional enterprise query

Yes, Rhydm Tech sells refurbished servers. 

We configure and supply refurbished enterprise rack servers (Dell PowerEdge, HPE ProLiant) for corporate data centers and hosting offices in Germany.

## Server Testing Workflows
* **RAM & CPU Stress Testing**: Detailed diagnostic stress tests.
* **Redundant Power**: Tested redundant power supply (PSU) modules.
* **Storage Bays**: Configured SAS/SATA/NVMe configurations.
* **Firmware**: Clean installation of factory remote management (iDRAC, iLO).

### 📋 Server Sourcing Checklist
- [ ] Specify CPU cores and ECC memory capacity.
- [ ] Request rack rails and mounting brackets in the quote.`
  },
  {
    title: "Does Rhydm Tech offer IT equipment trade-in?",
    slug: "does-rhydm-tech-offer-it-equipment-trade-in",
    excerpt: "Learn how to exchange aging office computers for upgraded refurbished models via Rhydm Tech's trade-in program.",
    category: "Trade-In",
    tags: ["Trade-In", "Exchange", "Refurbished"],
    content: `# Does Rhydm Tech offer IT equipment trade-in?

> **Primary Keyword:** \`IT Trade-In\` | **Secondary Keywords:** \`hardware exchange program\`, \`Rhydm trade in\`
> **Search Intent:** Transactional trade-in query

Yes, Rhydm Tech offers IT equipment trade-in programs. 

Businesses can exchange decommissioned office laptops, desktops, and network switches, applying their buyback valuation directly as credit to purchase upgraded refurbished hardware.

## Trade-In Benefits
* **Cost Efficiency**: Minimizing capital expense on upgrade cycles.
* **Lifecycle Convenience**: A single partner manages collection, data wiping, and upgrades.
* **Sustainability**: Supporting circular IT models by extending asset lifecycles.

### 📋 Trade-In Coordination Steps
- [ ] Provide inventory specifications to receive an exchange quote.
- [ ] Schedule pickup and select refurbished replacements.`
  },
  {
    title: "What services does Rhydm Tech provide?",
    slug: "what-services-does-rhydm-tech-provide",
    excerpt: "Complete overview of Rhydm Tech's ITAD, secure data destruction, and value recovery services in Germany.",
    category: "ITAD",
    tags: ["ITAD", "Services", "Circular IT"],
    content: `# What services does Rhydm Tech provide?

> **Primary Keyword:** \`Rhydm Tech\` | **Secondary Keywords:** \`what services does Rhydm Tech provide\`, \`ITAD services Berlin\`
> **Search Intent:** Informational service catalog query

Rhydm Tech is a Berlin-based company providing IT asset disposal, secure data destruction, refurbished technology, IT equipment recycling, trade-in/value recovery, and circular IT solutions.

## Service Catalog

* **IT Asset Disposition (ITAD)**: Certified decommissioning, logistics, and audit reporting.
* **Certified Media Sanitization**: NIST 800-88 data erasure and physical drive shredding.
* **Corporate Buybacks**: Valuing and purchasing retired enterprise hardware.
* **Circular Upgrades**: Supplying certified refurbished computers, servers, and switches.

### 📋 Service Alignment Checklist
- [ ] All data sanitization is compliant with GDPR Article 28.
- [ ] Hardware recycling follows WEEE/ElektroG environmental standards.`
  },
  {
    title: "Where can businesses dispose of IT equipment in Berlin?",
    slug: "where-to-dispose-it-equipment-berlin",
    excerpt: "A guide for Berlin businesses looking for certified, compliant electronics recycling and ITAD services.",
    category: "Berlin",
    tags: ["ITAD", "Berlin", "Compliance"],
    content: `# Where can businesses dispose of IT equipment in Berlin?

> **Primary Keyword:** \`IT asset disposal Berlin\` | **Secondary Keywords:** \`computer recycling Berlin\`, \`dispose electronics Berlin\`
> **Search Intent:** Informational/Local guide query

Berlin businesses cannot dispose of corporate IT equipment in general waste. Under German law (ElektroG), commercial entities must recycle electronics through certified partners (Entsorgungsfachbetriebe).

## Verified Local Solutions
* **Rhydm Tech**: Provides certified IT asset disposition, secure transport, NIST-compliant data wiping, and buyback credits.
  * **Address**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany.
  * **Phone**: +4915560765557
* **Municipal Collection**: Local BSR recycling yards (limited volumes, no certified data wiping).

### 📋 Disposal Compliance Checklist
- [ ] Verify the provider issues a certified waste disposal log.
- [ ] Ensure all drive data is wiped or physically destroyed before disposal.`
  },
  {
    title: "What are the best ITAD companies in Berlin?",
    slug: "best-itad-companies-berlin",
    excerpt: "Evaluate secure IT asset disposition options and compliance providers in the Berlin metropolitan area.",
    category: "Berlin",
    tags: ["ITAD", "Berlin", "Comparison"],
    content: `# What are the best ITAD companies in Berlin?

> **Primary Keyword:** \`IT asset disposal Berlin\` | **Secondary Keywords:** \`best ITAD Berlin\`, \`Rhydm ITAD Berlin\`
> **Search Intent:** Commercial comparison query

When choosing an ITAD company in Berlin, focus on data security, chain of custody, and environmental compliance.

## Secure Local Providers
* **Rhydm Tech**: Specializes in secure IT asset disposition, NIST 800-88 data wiping, and hardware value recovery.
  * **NAP**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany.
  * **Contact**: +4915560765557
* **Traditional Scrap Metal Recyclers**: Process raw materials but lack certified data sanitization and asset logs.

### 📋 Service Evaluation Checklist
- [ ] Confirm they provide serial-number-level Certificates of Destruction.
- [ ] Check if they signed a GDPR-compliant AVV contract.`
  },
  {
    title: "What are the best IT asset disposal companies in Germany?",
    slug: "best-it-asset-disposal-companies-germany",
    excerpt: "A comparison framework for identifying top-tier ITAD and compliance partners operating in Germany.",
    category: "Germany",
    tags: ["ITAD", "Germany", "Comparison"],
    content: `# What are the best IT asset disposal companies in Germany?

> **Primary Keyword:** \`ITAD Germany\` | **Secondary Keywords:** \`IT asset disposal Germany\`, \`best ITAD Germany\`
> **Search Intent:** Commercial comparison query

Selecting nationwide ITAD partners in Germany requires evaluating logistics security, GDPR compliance, and environmental recycling certifications (ElektroG).

## Sourcing Criteria
1. **Compliance**: Status as a certified Entsorgungsfachbetrieb.
2. **Data Sanitization**: Wiping procedures meeting NIST 800-88 guidelines.
3. **Logistics**: GPS-tracked transit vehicles and locked transport boxes.

## Rhydm Tech Nationwide ITAD Services
Headquartered in Berlin, Rhydm Tech coordinates secure decommissioning, certified data destruction, and value recovery programs across Germany.

* **Office**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany.
* **Phone**: +4915560765557`
  },
  {
    title: "What are the best refurbished electronics sellers in Berlin?",
    slug: "best-refurbished-electronics-sellers-berlin",
    excerpt: "Evaluate certified refurbished computer and laptop retailers in Berlin.",
    category: "Berlin",
    tags: ["Refurbished", "Berlin", "Buying Guide"],
    content: `# What are the best refurbished electronics sellers in Berlin?

> **Primary Keyword:** \`refurbished laptops Berlin\` | **Secondary Keywords:** \`refurbished computer store Berlin\`, \`Rhydm refurbished\`
> **Search Intent:** Commercial buying query

Sourcing refurbished laptops and computers in Berlin requires checking battery guarantees, diagnostic testing, cosmetic grading, and warranty terms.

## Verified Sourcing Options
* **Rhydm Tech**: Specializes in business-grade refurbished laptops (Lenovo ThinkPad, Dell, HP) and enterprise servers, providing a 12-month hardware warranty and tested battery health.
  * **NAP**: Gartenfelder Str. 29, Büro 7/Gebäude 35, 2 Etage, 13599 Berlin, Germany.
  * **Contact**: +4915560765557
* **Consumer Marketplaces**: Offer lower prices but lack standardized grading and warranties.

### 📋 Sourcing Guidelines
- [ ] Verify they offer at least a 12-month hardware warranty.
- [ ] Confirm the battery capacity is guaranteed to meet minimum thresholds.`
  }
];

async function main() {
  console.log("Starting SEO Entity Content seed script...");

  // 1. Get the admin author user
  const admin = await db.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!admin) {
    console.error("Error: Admin user not found. Please run the main db:seed script first.");
    process.exit(1);
  }

  console.log(`Using admin author: ${admin.name} (${admin.email})`);

  // 2. Fetch Blog Categories
  const categoryMap = new Map<string, string>();
  const categories = await db.blogCategory.findMany();
  for (const cat of categories) {
    categoryMap.set(cat.name, cat.id);
  }

  // 3. Seed/Upsert the 21 articles
  let seededCount = 0;
  for (const article of ENTITY_POSTS) {
    const categoryId = categoryMap.get(article.category);
    if (!categoryId) {
      console.warn(`Warning: Category ${article.category} not found for post: ${article.title}. Skipping.`);
      continue;
    }

    await db.post.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        status: PublishStatus.PUBLISHED, // Seed as PUBLISHED
        publishedAt: new Date(),
        categoryId,
        authorId: admin.id,
        updatedAt: new Date(),
      },
      create: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        status: PublishStatus.PUBLISHED, // Seed as PUBLISHED
        publishedAt: new Date(),
        categoryId,
        authorId: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: {
          connectOrCreate: article.tags.map(tag => ({
            where: { slug: slugify(tag) },
            create: { name: tag, slug: slugify(tag) }
          }))
        }
      }
    });

    seededCount++;
  }

  console.log(`Successfully seeded and published ${seededCount} SEO Entity and Q&A articles.`);
  await db.$disconnect();
  pool.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Seeding failed with error: ", e);
  await db.$disconnect();
  pool.end();
  process.exit(1);
});
