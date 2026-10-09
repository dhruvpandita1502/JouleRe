
import { campusFacilities } from "./campusFacilities";

// DEMO CONFIGURATION.
// These fractions and yields are illustrative, not validated facility data.
// Update them using actual waste audits and facility operating data.

const ROUTING = {
  organic: {
    recyclable: 0,
    reuse: 0,
    biogas: 0.65,
    compost: 0.30,
    wte: 0,
    landfill: 0.05,
    energyKwhPerKg: 0.35,
    label: "Organic waste",
    keywords: [
      "leftover", "rice", "roti", "samosa", "food", "vegetable",
      "vegetables", "fruit", "banana", "peel", "peels", "dal",
      "curry", "chapati", "sabzi", "canteen scraps", "food scraps",
    ],
    advice: "Track meal demand, improve portion choices, and donate suitable surplus food safely.",
  },
  paper: {
    recyclable: 0.75,
    reuse: 0.10,
    biogas: 0,
    compost: 0,
    wte: 0.10,
    landfill: 0.05,
    energyKwhPerKg: 1.0,
    label: "Paper and cardboard",
    keywords: [
      "newspaper", "notebook", "cardboard", "carton", "paper",
      "book", "paper plate", "paper cup",
    ],
    advice: "Use digital notices, reusable serving ware, and clean, dry paper collection bins.",
  },
  plastic: {
    recyclable: 0.65,
    reuse: 0.05,
    biogas: 0,
    compost: 0,
    wte: 0.20,
    landfill: 0.10,
    energyKwhPerKg: 2.0,
    label: "Plastic",
    keywords: [
      "plastic bottle", "plastic bottles", "plastic cup", "plastic plate",
      "chips packet", "wrapper", "wrappers", "polythene", "polybag",
      "plastic", "bottle", "bottles", "packet", "packets",
    ],
    advice: "Introduce refill stations, reusable bottles, and procurement rules that reduce single-use packaging.",
  },
  metal: {
    recyclable: 0.90,
    reuse: 0,
    biogas: 0,
    compost: 0,
    wte: 0,
    landfill: 0.10,
    energyKwhPerKg: 0,
    label: "Metal",
    keywords: [
      "aluminium", "aluminum", "steel", "metal", "can", "cans",
      "tin", "foil",
    ],
    advice: "Provide clearly labelled metal collection bins and reuse durable containers where possible.",
  },
  glass: {
    recyclable: 0.90,
    reuse: 0,
    biogas: 0,
    compost: 0,
    wte: 0,
    landfill: 0.10,
    energyKwhPerKg: 0,
    label: "Glass",
    keywords: ["glass bottle", "glass", "jar"],
    advice: "Prefer returnable containers and provide a safe, separate glass collection point.",
  },
  ewaste: {
    recyclable: 0,
    reuse: 0.20,
    biogas: 0,
    compost: 0,
    wte: 0,
    landfill: 0,
    specialist: 0.80,
    energyKwhPerKg: 0,
    label: "E-waste",
    keywords: [
      "phone charger", "mobile phone", "old phone", "charger",
      "battery", "laptop", "computer", "keyboard", "mouse",
      "earphone", "headphone", "electronic", "electronics",
      "e-waste", "ewaste",
    ],
    advice: "Extend device life, repair equipment, and use authorized e-waste collection. Do not put batteries in ordinary bins.",
  },
  textile: {
    recyclable: 0.25,
    reuse: 0.40,
    biogas: 0,
    compost: 0,
    wte: 0.15,
    landfill: 0.20,
    energyKwhPerKg: 1.0,
    label: "Textile",
    keywords: [
      "clothes", "cloth", "shirt", "jeans", "fabric", "textile",
      "t-shirt", "tshirt",
    ],
    advice: "Run clothing swaps, repair drives, and reuse or donation programmes before disposal.",
  },
  residual: {
    recyclable: 0,
    reuse: 0,
    biogas: 0,
    compost: 0,
    wte: 0.70,
    landfill: 0.30,
    energyKwhPerKg: 1.5,
    label: "Unclassified residual",
    keywords: [],
    advice: "Audit this material stream before routing it. Better sorting may reveal recyclable or organic material.",
  },
};

const MATERIAL_ORDER = [
  "ewaste", "organic", "paper", "plastic", "metal", "glass", "textile",
];

function identifyMaterials(description) {
  const text = description.toLowerCase();

  return MATERIAL_ORDER.filter((id) =>
    ROUTING[id].keywords.some((keyword) => text.includes(keyword))
  );
}

function toKg(quantity, unit) {
  return unit === "g" ? quantity / 1000 : quantity;
}

function allocateMass(materialId, massKg) {
  const rules = ROUTING[materialId];
  const result = {
    recyclableKg: massKg * rules.recyclable,
    reusableKg: massKg * rules.reuse,
    biogasKg: massKg * rules.biogas,
    compostKg: massKg * rules.compost,
    wteKg: massKg * rules.wte,
    landfillKg: massKg * rules.landfill,
    specialistKg: massKg * (rules.specialist || 0),
  };

  const accepted = {
    recyclable: campusFacilities.recycling.available,
    biogas: campusFacilities.biogas.available,
    compost: campusFacilities.composting.available,
    wte: campusFacilities.wasteToEnergy.available,
  };

  // If a route is unavailable, its allocated mass becomes residual.
  if (!accepted.recyclable) {
    result.landfillKg += result.recyclableKg;
    result.recyclableKg = 0;
  }
  if (!accepted.biogas) {
    result.landfillKg += result.biogasKg;
    result.biogasKg = 0;
  }
  if (!accepted.compost) {
    result.landfillKg += result.compostKg;
    result.compostKg = 0;
  }
  if (!accepted.wte) {
    result.landfillKg += result.wteKg;
    result.wteKg = 0;
  }

  const energyKg = result.biogasKg + result.wteKg;
  result.energyKwh = energyKg * rules.energyKwhPerKg;

  return result;
}

export function analyzeCampusWaste(description, quantity, unit = "kg") {
  const amount = Number(quantity);

  if (!description.trim()) {
    throw new Error("Enter a description of your waste.");
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
    throw new Error("Enter a quantity greater than zero and no more than 1,000 kg.");
  }

  const totalKg = toKg(amount, unit);
  const ids = identifyMaterials(description);

  if (ids.length === 0) {
    return {
      unknown: true,
      totalKg,
      materials: [],
      totals: null,
      recommendations: [
        "Describe the material more specifically.",
        "If the waste is mixed, separate it into identifiable material groups.",
        "Ask the campus waste team to audit unclassified material.",
      ],
    };
  }

  // Demo assumption: total weight is split evenly across detected
  // material categories until item-level weights are collected.
  const massPerMaterial = totalKg / ids.length;

  const materials = ids.map((id) => {
    const rules = ROUTING[id];
    const allocation = allocateMass(id, massPerMaterial);

    return {
      id,
      name: rules.label,
      massKg: massPerMaterial,
      routeAdvice: rules.advice,
      ...allocation,
    };
  });

  const totals = materials.reduce(
    (sum, item) => {
      for (const key of [
        "recyclableKg",
        "reusableKg",
        "biogasKg",
        "compostKg",
        "wteKg",
        "landfillKg",
        "specialistKg",
        "energyKwh",
      ]) {
        sum[key] += item[key];
      }
      return sum;
    },
    {
      recyclableKg: 0,
      reusableKg: 0,
      biogasKg: 0,
      compostKg: 0,
      wteKg: 0,
      landfillKg: 0,
      specialistKg: 0,
      energyKwh: 0,
    }
  );

  const recommendations = [...new Set(ids.map((id) => ROUTING[id].advice))];

  recommendations.push(
    "Weigh each material separately to improve the accuracy of the allocation.",
    "Compare predicted routes with actual facility acceptance, contamination, and measured recovery data."
  );

  return {
    unknown: false,
    totalKg,
    materials,
    totals,
    recommendations,
    demoMode: true,
  };
}
