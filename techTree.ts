
import { Technology } from './types';

export const techData: { technologies: Technology[] } = {
  "technologies": [
    // I. Theory Branch
    { "id": "th1", "name": "Modern Theory", "time": "Initial", "prereqs": [], "effect": "Unlock basic tech tree", "location": "Any Research Station", "branch": "Theory" },
    { "id": "th2", "name": "3+1D Universe", "time": "2 Days", "prereqs": ["th1"], "effect": "Unlock high-dimensional physical rules", "location": "Any Research Station", "branch": "Theory" },
    { "id": "th3", "name": "Grand Unification", "time": "5 Days", "prereqs": ["th2"], "effect": "Link gravity and quantum tech", "location": "Black Hole Station", "branch": "Theory" },
    { "id": "th4", "name": "4+1D Universe", "time": "1 Day", "prereqs": ["th3", "eg6"], "effect": "Unlock Klein bottle research", "location": "Klein Event Station", "branch": "Theory" },
    { "id": "th5", "name": "Micro-Universe Tech", "time": "3 Days", "prereqs": ["th4"], "effect": "Unlock micro-universe tractor module", "location": "Klein Station", "branch": "Theory" },
    { "id": "th6", "name": "Source Theory", "time": "4 Days", "prereqs": ["th4"], "effect": "Unlock ultimate mass-energy conversion", "location": "SMBH Station", "branch": "Theory" },

    // II. Energy Branch
    { "id": "ey1", "name": "Solar Power", "time": "Initial", "prereqs": [], "effect": "Build solar panels", "location": "None", "branch": "Energy" },
    { "id": "ey2", "name": "Fusion", "time": "1 Day", "prereqs": ["ey1"], "effect": "Build fusion reactors", "location": "Any Research Station", "branch": "Energy" },
    { "id": "ey3", "name": "Antimatter", "time": "2 Days", "prereqs": ["ey2"], "effect": "Unlock Dyson structures", "location": "Neutron Star Station", "branch": "Energy" },
    { "id": "ey4", "name": "Zero Point", "time": "3 Days", "prereqs": ["ey3", "th4"], "effect": "Build Zero-Point mines", "location": "Black Hole Station", "branch": "Energy" },

    // III. Materials Branch
    { "id": "mt1", "name": "Iron Engineering", "time": "Initial", "prereqs": [], "effect": "Speed limit 0.01c, Strength 10", "location": "None", "branch": "Materials" },
    { "id": "mt2", "name": "Nano Materials", "time": "2 Days", "prereqs": ["mt1"], "effect": "Speed 0.1c, Strength 20", "location": "Any Research Station", "branch": "Materials" },
    { "id": "mt3", "name": "Carbyne", "time": "3 Days", "prereqs": ["mt2"], "effect": "Speed 0.2c, Strength 50", "location": "Any Research Station", "branch": "Materials" },
    { "id": "mt4", "name": "Star Gold", "time": "3 Days", "prereqs": ["mt3", "eg4", "th3"], "effect": "Speed 0.6c, Strength 150", "location": "Any Research Station", "branch": "Materials" },
    { "id": "mt5", "name": "Carbyne-Gold Alloy", "time": "1 Day", "prereqs": ["mt4"], "effect": "Speed 0.4c, Strength 100", "location": "Any Research Station", "branch": "Materials" },
    { "id": "mt6", "name": "Dense Neutron", "time": "4 Days", "prereqs": ["mt4"], "effect": "Speed 1c, Strength 300", "location": "Neutron Star Station", "branch": "Materials" },
    { "id": "mt7", "name": "Strong Interaction", "time": "4 Days", "prereqs": ["mt6", "th4"], "effect": "Speed 1c, Infinite Strength", "location": "Black Hole Station", "branch": "Materials" },

    // IV. Comms Branch
    { "id": "cm1", "name": "EM Waves", "time": "Initial", "prereqs": [], "effect": "Short range low-speed comms", "location": "None", "branch": "Comms" },
    { "id": "cm2", "name": "Quantum Comms", "time": "1 Day", "prereqs": ["cm1"], "effect": "High speed comms (<10c)", "location": "Any Research Station", "branch": "Comms" },
    { "id": "cm3", "name": "Tachyon Comms", "time": "3 Days", "prereqs": ["cm2", "th3"], "effect": "Faster-than-light unlimited comms", "location": "Black Hole Station", "branch": "Comms" },
    { "id": "cm4", "name": "Hyperspace Membrane", "time": "4 Days", "prereqs": ["cm3", "th6"], "effect": "Universal real-time comms", "location": "SMBH Station", "branch": "Comms" },

    // V. Sensing Branch
    { "id": "sn1", "name": "EM Radar", "time": "Initial", "prereqs": [], "effect": "Range: 5 LY", "location": "None", "branch": "Sensing" },
    { "id": "sn2", "name": "Tachyon Radar", "time": "1 Day", "prereqs": ["sn1", "cm3"], "effect": "Range: 50 LY", "location": "Any Research Station", "branch": "Sensing" },
    { "id": "sn3", "name": "Hyperspace Radar", "time": "3 Days", "prereqs": ["sn2", "cm4"], "effect": "Universal real-time monitoring", "location": "Any Research Station", "branch": "Sensing" },

    // VI. Engine Branch
    { "id": "eg1", "name": "Propellant Engine", "time": "Initial", "prereqs": [], "effect": "0.01c, Consumes 1 Energy", "location": "None", "branch": "Engines" },
    { "id": "eg2", "name": "Radiation Engine", "time": "1 Day", "prereqs": ["eg1"], "effect": "0.15c, Consumes 10 Energy", "location": "Any Research Station", "branch": "Engines" },
    { "id": "eg3", "name": "Antimatter Engine", "time": "1 Day", "prereqs": ["eg2", "ey3"], "effect": "0.5c, Consumes 1H + 1Anti-H", "location": "Any Research Station", "branch": "Engines" },
    { "id": "eg4", "name": "Warp Drive Lv.1", "time": "3 Days", "prereqs": ["eg3", "th3"], "effect": "1c, Daily cost 100 Energy", "location": "Any Research Station", "branch": "Engines" },
    { "id": "eg5", "name": "Warp Drive Lv.2", "time": "3 Days", "prereqs": ["eg4", "cm3"], "effect": "5c, Daily cost 150 Energy", "location": "Any Research Station", "branch": "Engines" },
    { "id": "eg6", "name": "Warp Drive Lv.3", "time": "1 Day", "prereqs": ["eg5"], "effect": "10c, Daily cost 200 Energy", "location": "Any Research Station", "branch": "Engines" },
    { "id": "eg7", "name": "Wormhole Engine", "time": "3 Days", "prereqs": ["eg6", "th4"], "effect": "Instant teleportation (Cost 1000 x Distance Energy)", "location": "Any Research Station", "branch": "Engines" },

    // VII. Protection Branch
    { "id": "pt1", "name": "Dust Shield", "time": "Initial", "prereqs": [], "effect": "Passive: Consume 1 Iron to block 20% Laser damage", "location": "Any Research Station", "branch": "Protection" },
    { "id": "pt2", "name": "Plasma Shield", "time": "1 Day", "prereqs": ["pt1"], "effect": "Active: Consume 15 Energy to block 100 damage", "location": "Any Research Station", "branch": "Protection" },
    { "id": "pt3", "name": "Magnetic Shield", "time": "1 Day", "prereqs": ["pt2"], "effect": "Active: Consume 40 Energy to block 200 damage", "location": "Any Research Station", "branch": "Protection" },
    { "id": "pt4", "name": "Gravity Shield", "time": "3 Days", "prereqs": ["pt3", "ey3", "th3"], "effect": "Active: Deflect attacks, consumes 40 Energy", "location": "Any Research Station", "branch": "Protection" },
    { "id": "pt5", "name": "Rift Shield", "time": "3 Days", "prereqs": ["pt4"], "effect": "Active: Consume 500 Energy to block all attacks", "location": "Any Research Station", "branch": "Protection" },
    { "id": "pt6", "name": "4D Shield", "time": "3 Days", "prereqs": ["th6"], "effect": "Active: Consume 600 Energy to block 2000 damage", "location": "Any Research Station", "branch": "Protection" },
    { "id": "pt7", "name": "Ascend 4D", "time": "3 Days", "prereqs": ["pt6"], "effect": "Active: Consume 700 Energy to immune all damage", "location": "Any Research Station", "branch": "Protection" },
    { "id": "pt8", "name": "5D Shield", "time": "4 Days", "prereqs": ["pt6"], "effect": "Active: Consume 8000 Energy to block 4000 damage", "location": "Any Research Station", "branch": "Protection" },
    { "id": "pt9", "name": "Ascend 5D", "time": "4 Days", "prereqs": ["pt8"], "effect": "Active: Consume 9000 Energy to immune all damage", "location": "Any Research Station", "branch": "Protection" },

    // VIII. Weapons - Kinetic
    { "id": "wk1", "name": "Railgun Lv.1", "time": "Initial", "prereqs": [], "effect": "2 Energy + 1 Iron, 20 Damage (Range: 5 LY)", "location": "None", "branch": "Kinetic" },
    { "id": "wk2", "name": "Railgun Lv.2", "time": "1 Day", "prereqs": ["wk1"], "effect": "4 Energy + 1 Iron, 40 Damage", "location": "Any Research Station", "branch": "Kinetic" },
    { "id": "wk3", "name": "Railgun Lv.3", "time": "1 Day", "prereqs": ["wk2"], "effect": "8 Energy + 1 Iron, 80 Damage", "location": "Any Research Station", "branch": "Kinetic" },
    { "id": "wk4", "name": "Antimatter Missile", "time": "1 Day", "prereqs": ["wk3", "ey3"], "effect": "1 Anti-H + 2 Iron + 10 Energy, Destroys target", "location": "Any Research Station", "branch": "Kinetic" },
    { "id": "wk5", "name": "Black Hole Missile", "time": "3 Days", "prereqs": ["wk4", "th3"], "effect": "2 Iron + 20 Energy, 150 Damage (Shield Penetration)", "location": "Any Research Station", "branch": "Kinetic" },
    { "id": "wk6", "name": "Gravity Missile", "time": "2 Days", "prereqs": ["wk5"], "effect": "3 Iron + 10 Energy, 200 Damage (Shield Penetration)", "location": "Any Research Station", "branch": "Kinetic" },
    { "id": "wk7", "name": "Space-Time Trap", "time": "1 Day", "prereqs": ["wk5", "eg6"], "effect": "Disable warp drives in 1 LY for 3 days", "location": "Any Research Station", "branch": "Kinetic" },

    // VIII. Weapons - Energetic
    { "id": "we1", "name": "Laser Lv.1", "time": "Initial", "prereqs": [], "effect": "4 Energy, 10 Damage (Range: 5 LY)", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we2", "name": "Laser Lv.2", "time": "1 Day", "prereqs": ["we1"], "effect": "8 Energy, 20 Damage", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we3", "name": "Laser Lv.3", "time": "1 Day", "prereqs": ["we2"], "effect": "16 Energy, 40 Damage", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we4", "name": "Antimatter Beam", "time": "1 Day", "prereqs": ["we3", "ey3"], "effect": "5 Energy + 1 Anti-H, Destroys target (Range: 1 LY)", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we5", "name": "Neutron Storm", "time": "2 Days", "prereqs": ["we4"], "effect": "10 Energy, Destroys life (Range: 1 LY)", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we6", "name": "Decomposition Ray", "time": "3 Days", "prereqs": ["we5", "th3"], "effect": "100 Energy, Destroys target (Range: 1 LY)", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we7", "name": "Star Burst", "time": "4 Days", "prereqs": ["we6"], "effect": "5000 Energy, 1000 Damage (2 LY Area)", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we8", "name": "Dual Burst", "time": "4 Days", "prereqs": ["we7", "th5"], "effect": "1000 Energy, 2000 Damage, requires Anti-Sun", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we9", "name": "Space Rift", "time": "1 Day", "prereqs": ["we6"], "effect": "500 Energy, Instant destruction (Range: 2 LY)", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we10", "name": "Dark Matter", "time": "5 Days", "prereqs": ["we9", "th4"], "effect": "1000 Energy, 1000 Damage (Range: 5 LY)", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we11", "name": "4D Blast", "time": "5 Days", "prereqs": ["we10", "pt6"], "effect": "10000 Energy, 1000 Damage (Range: 3 LY)", "location": "Any Research Station", "branch": "Energy Weapons" },
    { "id": "we12", "name": "Dual Vector Foil", "time": "5 Days", "prereqs": ["we11", "pt8"], "effect": "10000 Energy, 1000 Damage (Range: 1 LY)", "location": "Any Research Station", "branch": "Energy Weapons" },

    // IX. Mining Branch
    { "id": "mi1", "name": "Mining Facility", "time": "Initial", "prereqs": [], "effect": "Produces 1 Iron per day", "location": "None", "branch": "Mining" },
    { "id": "mi2", "name": "Nano Mining", "time": "1 Day", "prereqs": ["mi1"], "effect": "3 Energy -> 3 Iron per day", "location": "Any Research Station", "branch": "Mining" },
    { "id": "mi3", "name": "Star Annihilator", "time": "3 Days", "prereqs": ["mi2", "pt4"], "effect": "500 Energy to plunder 50% planets iron", "location": "Any Research Station", "branch": "Mining" },
    { "id": "mi4", "name": "Mass-Energy Convert", "time": "2 Days", "prereqs": ["mi3", "th6"], "effect": "50000 Energy -> 1 Iron", "location": "Any Research Station", "branch": "Mining" }
  ]
};
