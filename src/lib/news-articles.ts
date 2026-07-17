export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  body: string;
  imageUrl: string;
};


export const ARTICLES: Article[] = [
  {
    slug: "lifepo4-batteries-lebanon",
    title: "Why LiFePO₄ Batteries Are Winning Lebanese Rooftops",
    excerpt:
      "The new generation of lithium iron phosphate batteries handles Beirut summers, dusty balconies, and daily deep cycling — here's what changed in 2025.",
    date: "March 12, 2026",
    category: "Battery Tech",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276",
    body:
      "For years, Lebanese households relied on flooded lead-acid banks that needed constant topping-up, ventilated rooms, and rarely lasted more than three summers. LiFePO₄ (lithium iron phosphate) chemistry has quietly become the new default. It tolerates ambient temperatures above 45°C without significant capacity loss, delivers 6,000+ cycles at 80% depth of discharge, and requires zero maintenance.\n\nThe economics finally tipped in 2025: wholesale prices dropped roughly 22% year-over-year as Chinese manufacturers scaled up production, bringing installed cost per usable kWh under $450 for the first time. Combined with a 10-year warranty from most reputable brands, LiFePO₄ now offers a cost-per-cycle that beats lead-acid within 18 months of installation.\n\nFor a typical Beirut apartment running 6-8 kWh of nightly consumption, a 10 kWh LiFePO₄ bank paired with a 3-5 kW rooftop array can eliminate generator dependence entirely — a scenario that was aspirational just two years ago.",
  },
  {
    slug: "government-incentives-2026",
    title: "Lebanon's 2026 Solar Incentive Framework: What Homeowners Should Know",
    excerpt:
      "Reduced customs duties on inverters and batteries, plus a new net-metering pilot in Mount Lebanon, are changing the calculus for residential installs.",
    date: "February 28, 2026",
    category: "Policy",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9",
    body:
      "The Ministry of Energy and Water quietly rolled out a revised customs schedule in January 2026 that reduces import duties on hybrid inverters and lithium storage systems from 11% to 3% — a change that has already trickled into retail pricing. For a 5 kW system, this alone represents savings of $250-$400.\n\nMore significant is the Mount Lebanon net-metering pilot, which allows residential producers to feed excess daytime generation back to Électricité du Liban's improving grid in exchange for credits redeemable during winter months. Enrollment is limited to systems under 10 kW and requires a bidirectional meter, but early adopters report a 15-20% improvement in effective ROI.\n\nHomeowners considering an installation this year should ensure their installer is registered with the Lebanese Center for Energy Conservation (LCEC), as only certified installations qualify for the incentive framework.",
  },
  {
    slug: "dust-heat-maintenance",
    title: "Maintaining Your Solar Array in Lebanon's Dust and Heat",
    excerpt:
      "Simple monthly habits can preserve 8-12% of your annual generation. A short field guide from installers working across Bekaa and the coast.",
    date: "February 10, 2026",
    category: "Maintenance",
    imageUrl: "https://images.unsplash.com/photo-1700529289398-dd313f11c9cc",
    body:
      "Panels in Lebanon face two enduring enemies: fine Saharan dust that settles after every khamaseen, and sustained summer roof temperatures that push cells past their optimal operating window.\n\nDust management is the higher-impact of the two. A single monthly rinse with soft water (avoid pressure washers, which can damage anti-reflective coatings) recovers most lost output. In coastal areas, salt buildup adds a second layer of grime that responds well to a diluted vinegar wipe on the frames every quarter.\n\nHeat is trickier. Panels lose roughly 0.4% output per degree above 25°C cell temperature, and rooftop cells routinely hit 65°C in July. Ensuring at least 10 cm of airflow clearance behind panels — a common installation shortcut that gets skipped — recovers 3-5% of summer generation. If you're commissioning a new system, insist on this in your contract.\n\nFinally: keep an eye on your inverter's error log via the mobile app. A single string underperforming by 15% or more usually indicates a shaded panel, a loose MC4 connector, or an early cell defect worth addressing before warranty windows close.",
  },
  {
    slug: "chouf-community-solar",
    title: "How a Chouf Village Built a Shared 80 kW Solar Grid",
    excerpt:
      "Thirty-two households in Baakline pooled resources to install a community solar co-op that now covers 70% of their combined load — and cut generator noise in half.",
    date: "January 22, 2026",
    category: "Community",
    imageUrl: "https://images.unsplash.com/photo-1771479755134-9c1e3143c110",
    body:
      "In the village of Baakline in the Chouf district, a group of thirty-two households did what individual budgets couldn't: they collectively financed an 80 kW rooftop-and-ground-mount installation with 200 kWh of shared battery storage, run as a small cooperative.\n\nThe project, coordinated by a returning engineer and funded through a mix of household contributions and a soft loan from a Lebanese diaspora fund, went live in October 2025. Six months in, it delivers roughly 70% of the co-op's combined electricity demand and has reduced diesel generator runtime from 8-10 hours daily to under 3.\n\nBeyond the numbers, residents describe a quieter village. Generator noise — the constant background of Lebanese nights for the past five years — has noticeably faded on the streets participating in the co-op. Neighbouring villages are now studying the model.\n\nCommunity solar remains legally ambiguous in Lebanon, but the Baakline structure — a private cooperative with individual metering behind a shared inverter cluster — appears to be defensible under existing electricity regulations. Several other villages in the Chouf, Metn, and North have reached out about replicating it.",
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
