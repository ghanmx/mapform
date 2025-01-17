export interface TowTruckType {
  name: string;
  capacity: string;
  perKm: number;
  maneuverCharge: number;
  maxWeight: number;
}

export const towTruckTypes: Record<string, TowTruckType> = {
  A: {
    name: "Tipo A",
    capacity: "hasta 2000kg",
    perKm: 25,
    maneuverCharge: 500,
    maxWeight: 2000
  },
  B: {
    name: "Tipo B",
    capacity: "hasta 3000kg",
    perKm: 35,
    maneuverCharge: 750,
    maxWeight: 3000
  },
  C: {
    name: "Tipo C",
    capacity: "hasta 4000kg",
    perKm: 45,
    maneuverCharge: 1000,
    maxWeight: 4000
  },
  D: {
    name: "Tipo D",
    capacity: "hasta 8000kg",
    perKm: 60,
    maneuverCharge: 1500,
    maxWeight: 8000
  }
};

export const calculateTotalCost = (
  distance: number,
  truckType: string,
  requiresManeuver: boolean,
  tollCosts: number = 0,
  requiresInvoice: boolean = false
): number => {
  const truck = towTruckTypes[truckType || 'A'];
  const baseCost = distance * truck.perKm;
  const maneuverCost = requiresManeuver ? truck.maneuverCharge : 0;
  const subtotal = baseCost + maneuverCost + tollCosts;
  const tax = requiresInvoice ? subtotal * 0.16 : 0;
  return subtotal + tax;
};

export const getTruckTypeForVehicle = (model: string): "A" | "B" | "C" | "D" => {
  const modelLower = model.toLowerCase();
  
  if (modelLower.includes('pickup') || modelLower.includes('suv')) {
    return "B";
  } else if (modelLower.includes('camion') || modelLower.includes('truck')) {
    return "D";
  } else if (modelLower.includes('van') || modelLower.includes('minivan')) {
    return "C";
  }
  
  return "A";
};