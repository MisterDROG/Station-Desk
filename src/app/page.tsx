"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

type Team = "crew" | "alien";
type ZoneId = "bridge" | "ops" | "reactor" | "breach";
type Rank = "front" | "rear";
type CrewRole = "assault" | "medic" | "engineer" | "ranger" | "hybrid";
type AlienRole = "hunter" | "tank" | "shooter" | "siege";
type Difficulty = "easy" | "medium";
type LogTone = "neutral" | "good" | "bad" | "critical";

type Unit = {
  id: string;
  name: string;
  title: string;
  team: Team;
  role: CrewRole | AlienRole;
  zone: ZoneId;
  rank: Rank;
  hp: number;
  maxHp: number;
  attack: number;
  armor: number;
  range: number;
  heal: number;
  repair: number;
  siege: number;
  speed: number;
  initiative: number;
  hasActed: boolean;
  hasMoved: boolean;
};

type UnitTemplate = Omit<Unit, "id" | "name" | "zone" | "rank" | "team" | "hasActed" | "hasMoved"> & {
  names: string[];
};

type LogEntry = {
  id: number;
  shift: number;
  text: string;
  tone: LogTone;
};

type LogGroup = {
  shift: number;
  entries: LogEntry[];
};

type Zone = {
  id: ZoneId;
  name: string;
  shortName: string;
  accent: string;
  description: string;
  hullDefense: number;
};

type Scenario = {
  units: Unit[];
  seed: number;
};

type Position = {
  zone: ZoneId;
  rank: Rank;
};

type AlienTurn = Position & {
  targetId: string | null;
  attacksHull: boolean;
  score: number;
};

const MAX_HULL = 24;
const zoneOrder: ZoneId[] = ["bridge", "ops", "reactor", "breach"];
const ranks: Rank[] = ["front", "rear"];
const boardPositions: Position[] = zoneOrder.flatMap((zone) => ranks.map((rank) => ({ zone, rank })));
const easyBoardPositions: Position[] = zoneOrder.slice(0, 3).flatMap((zone) => [
  { zone, rank: "front" },
  { zone, rank: "front" },
]);

const zones: Zone[] = [
  {
    id: "bridge",
    name: "Command Core",
    shortName: "CORE",
    accent: "bg-cyan-500",
    description: "Последний рубеж. Чужие здесь напрямую ломают корабль.",
    hullDefense: 0,
  },
  {
    id: "ops",
    name: "Ops Planning",
    shortName: "OPS",
    accent: "bg-blue-500",
    description: "Узел связи и удобная позиция для медиков и стрелков.",
    hullDefense: 1,
  },
  {
    id: "reactor",
    name: "Reactor Control",
    shortName: "RCTR",
    accent: "bg-amber-500",
    description: "Инженеры ремонтируют обшивку отсюда с полной эффективностью.",
    hullDefense: 2,
  },
  {
    id: "breach",
    name: "Hull Breach",
    shortName: "HLBR",
    accent: "bg-rose-500",
    description: "Точка абордажа и первая линия встречи с пришельцами.",
    hullDefense: 3,
  },
];

const crewNames = ["Ira", "Maks", "Rin", "Dima", "Tala", "Lev", "Nika", "Artem", "Yana", "Oleg", "Mira", "Sava", "Kira", "Anton", "Lina", "Vadim", "Zoya", "Roman"]
  .flatMap((firstName) => ["Voss", "Eder", "Sol", "Korr", "Reed", "Orlan", "Vale", "Quill", "Holt", "Kern", "Stern", "Rook", "Vega", "Morrow", "Drake", "Frost", "Lane", "Ward"]
    .map((lastName) => `${firstName} ${lastName}`));

function combineNameParts(prefixes: string[], forms: string[]) {
  return prefixes.flatMap((prefix) => forms.map((form) => `${prefix} ${form}`));
}

const crewTemplates: Record<CrewRole, UnitTemplate> = {
  assault: {
    names: ["Security Lead", "Breach Marshal", "Deck Guard"],
    title: "Security Lead",
    role: "assault",
    hp: 12,
    maxHp: 12,
    attack: 5,
    armor: 2,
    range: 1,
    heal: 0,
    repair: 1,
    siege: 0,
    speed: 1,
    initiative: 4,
  },
  medic: {
    names: ["Field Medic", "Trauma Officer", "Bio Specialist"],
    title: "Field Medic",
    role: "medic",
    hp: 8,
    maxHp: 8,
    attack: 2,
    armor: 0,
    range: 2,
    heal: 5,
    repair: 0,
    siege: 0,
    speed: 2,
    initiative: 3,
  },
  engineer: {
    names: ["Hull Engineer", "Reactor Keeper", "Systems Mechanic"],
    title: "Hull Engineer",
    role: "engineer",
    hp: 9,
    maxHp: 9,
    attack: 2,
    armor: 1,
    range: 1,
    heal: 1,
    repair: 6,
    siege: 0,
    speed: 1,
    initiative: 2,
  },
  ranger: {
    names: ["Railgun Operator", "Sensor Marksman", "Tactical Gunner"],
    title: "Railgun Operator",
    role: "ranger",
    hp: 8,
    maxHp: 8,
    attack: 4,
    armor: 0,
    range: 3,
    heal: 0,
    repair: 1,
    siege: 0,
    speed: 3,
    initiative: 4,
  },
  hybrid: {
    names: ["Ops Generalist", "Rescue Technician", "Mission Analyst"],
    title: "Ops Generalist",
    role: "hybrid",
    hp: 9,
    maxHp: 9,
    attack: 3,
    armor: 1,
    range: 2,
    heal: 2,
    repair: 3,
    siege: 0,
    speed: 2,
    initiative: 3,
  },
};

const alienTemplates: UnitTemplate[] = [
  {
    names: combineNameParts(["Shard", "Glass", "Needle", "Rift", "Void", "Razor"], ["Hunter", "Raptor", "Stalker", "Hound", "Claw", "Mantis"]),
    title: "Boarding Hunter",
    role: "hunter",
    hp: 7,
    maxHp: 7,
    attack: 4,
    armor: 0,
    range: 1,
    heal: 0,
    repair: 0,
    siege: 3,
    speed: 1,
    initiative: 4,
  },
  {
    names: combineNameParts(["Maw", "Spore", "Brood", "Bone", "Iron", "Shell"], ["Seeder", "Carrier", "Anchor", "Brute", "Crusher", "Bastion"]),
    title: "Armored Organism",
    role: "tank",
    hp: 11,
    maxHp: 11,
    attack: 3,
    armor: 2,
    range: 1,
    heal: 0,
    repair: 0,
    siege: 4,
    speed: 1,
    initiative: 1,
  },
  {
    names: combineNameParts(["Null", "Arc", "Pulse", "Echo", "Prism", "Static"], ["Lancer", "Sniper", "Leech", "Spitter", "Caster", "Seer"]),
    title: "Ranged Intruder",
    role: "shooter",
    hp: 7,
    maxHp: 7,
    attack: 3,
    armor: 1,
    range: 3,
    heal: 0,
    repair: 0,
    siege: 2,
    speed: 1,
    initiative: 3,
  },
  {
    names: combineNameParts(["Siege", "Hull", "Void", "Breach", "Core", "Rift"], ["Cyst", "Eater", "Ram", "Breaker", "Devourer", "Borer"]),
    title: "Siege Organism",
    role: "siege",
    hp: 9,
    maxHp: 9,
    attack: 2,
    armor: 1,
    range: 2,
    heal: 0,
    repair: 0,
    siege: 6,
    speed: 1,
    initiative: 2,
  },
];

function createRandom(seed: number) {
  let state = seed >>> 0;

  return function random() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], random: () => number) {
  const index = Math.floor(random() * items.length);
  return items[index];
}

function pickUnused(items: string[], usedItems: Set<string>, random: () => number) {
  const availableItems = items.filter((item) => !usedItems.has(item));
  const selectedItem = pick(availableItems, random);
  usedItems.add(selectedItem);
  return selectedItem;
}

function varyStat(value: number, random: () => number, minimum: number) {
  const roll = Math.floor(random() * 3) - 1;
  return Math.max(minimum, value + roll);
}

function varyWideStat(value: number, random: () => number, minimum: number) {
  const roll = Math.floor(random() * 5) - 2;
  return Math.max(minimum, value + roll);
}

function shuffle<T>(items: T[], random: () => number) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[targetIndex];
    shuffled[targetIndex] = current;
  }

  return shuffled;
}

function generateScenario(seed: number, difficulty: Difficulty): Scenario {
  const random = createRandom(seed);
  const randomRoles: CrewRole[] = ["assault", "medic", "engineer", "ranger", "hybrid"];
  let roles: CrewRole[] = ["medic", "engineer", "ranger", pick(randomRoles, random), pick(randomRoles, random)];
  let crewPositions = shuffle(boardPositions, random);

  if (difficulty === "easy") {
    roles = ["assault", "medic", "engineer"];
    crewPositions = shuffle(easyBoardPositions, random);
  }

  const availableNames = shuffle(crewNames, random);
  const usedAlienNames = new Set<string>();
  const units: Unit[] = [];

  roles.forEach((role, index) => {
    const template = crewTemplates[role];
    const maxHp = varyStat(template.maxHp, random, 6);
    const position = crewPositions[index];

    units.push({
      ...template,
      id: `crew-${seed}-${index}`,
      name: availableNames[index],
      title: pick(template.names, random),
      team: "crew",
      zone: position.zone,
      rank: position.rank,
      hp: maxHp,
      maxHp,
      attack: varyStat(template.attack, random, 1),
      armor: varyStat(template.armor, random, 0),
      heal: varyStat(template.heal, random, 0),
      repair: varyStat(template.repair, random, 0),
      speed: template.speed,
      hasActed: false,
      hasMoved: false,
    });
  });

  let alienCount = 5 + Math.floor(random() * 3);
  let alienPositions = shuffle(
    boardPositions.flatMap((position) => [{ ...position }, { ...position }]),
    random,
  );

  if (difficulty === "easy") {
    alienCount = 3;
    alienPositions = shuffle(easyBoardPositions, random);
  }

  for (let index = 0; index < alienCount; index += 1) {
    const template = pick(alienTemplates, random);
    let maxHp = varyWideStat(template.maxHp, random, 5);
    let attack = varyWideStat(template.attack, random, 1);
    let armor = varyWideStat(template.armor, random, 0);
    let range = varyStat(template.range, random, 1);
    let siege = varyWideStat(template.siege, random, 1);
    let speed = varyStat(template.speed, random, 1);
    let initiative = varyWideStat(template.initiative, random, 1);
    const position = alienPositions[index];

    if (difficulty === "easy") {
      maxHp = varyStat(template.maxHp, random, 5);
      attack = varyStat(template.attack, random, 1);
      armor = varyStat(template.armor, random, 0);
      range = template.range;
      siege = template.siege;
      speed = template.speed;
      initiative = template.initiative;
    }

    units.push({
      ...template,
      id: `alien-${seed}-${index}`,
      name: pickUnused(template.names, usedAlienNames, random),
      team: "alien",
      zone: position.zone,
      rank: position.rank,
      hp: maxHp,
      maxHp,
      attack,
      armor,
      range,
      siege,
      speed,
      initiative,
      hasActed: false,
      hasMoved: false,
    });
  }

  return { seed, units };
}

const initialDifficulty: Difficulty = "medium";
const initialScenario = generateScenario(73142, initialDifficulty);

function getZoneIndex(zone: ZoneId) {
  return zoneOrder.indexOf(zone);
}

function getRankIndex(rank: Rank) {
  if (rank === "front") {
    return 0;
  }

  return 1;
}

function getDistance(left: Unit, right: Unit) {
  const zoneDistance = Math.abs(getZoneIndex(left.zone) - getZoneIndex(right.zone));
  const rankDistance = Math.abs(getRankIndex(left.rank) - getRankIndex(right.rank));
  return zoneDistance + rankDistance;
}

function getPositionDistance(unit: Unit, zone: ZoneId, rank: Rank) {
  return getMovementDistance({ zone: unit.zone, rank: unit.rank }, { zone, rank });
}

function getMovementDistance(start: Position, target: Position) {
  if (start.zone === target.zone && start.rank === target.rank) {
    return 0;
  }

  let distance = Math.abs(getZoneIndex(start.zone) - getZoneIndex(target.zone));

  if (start.rank === "rear") {
    distance += 1;
  }

  if (target.rank === "rear") {
    distance += 1;
  }

  return distance;
}

function canMoveToPosition(unit: Unit, zone: ZoneId, rank: Rank) {
  const distance = getPositionDistance(unit, zone, rank);

  if (distance <= 0) {
    return false;
  }

  return distance <= unit.speed;
}

function clampDamage(rawDamage: number) {
  return Math.max(1, rawDamage);
}

function sortUnits(units: Unit[]) {
  return [...units].sort((left, right) => right.initiative - left.initiative);
}

function getDistanceFromPosition(position: Position, unit: Unit) {
  const zoneDistance = Math.abs(getZoneIndex(position.zone) - getZoneIndex(unit.zone));
  const rankDistance = Math.abs(getRankIndex(position.rank) - getRankIndex(unit.rank));
  return zoneDistance + rankDistance;
}

function canAttackFromPosition(attacker: Unit, position: Position, target: Unit) {
  if (target.rank === "rear" && attacker.range <= 1) {
    if (position.rank !== "front") {
      return false;
    }

    if (position.zone !== target.zone) {
      return false;
    }
  }

  return getDistanceFromPosition(position, target) <= attacker.range;
}

function canAttackUnit(attacker: Unit, target: Unit) {
  const attackerPosition: Position = { zone: attacker.zone, rank: attacker.rank };
  return canAttackFromPosition(attacker, attackerPosition, target);
}

function getZoneHullDefense(zoneId: ZoneId) {
  const zone = zones.find((item) => item.id === zoneId);

  if (!zone) {
    return 0;
  }

  return zone.hullDefense;
}

function getAlienHullDamage(alien: Unit, zone: ZoneId) {
  return Math.max(0, alien.siege - getZoneHullDefense(zone));
}

function getCrewTargetValue(unit: Unit, hull: number) {
  let value = unit.attack * 2 + unit.range;

  if (unit.heal > 0) {
    value += unit.heal * 4;
  }

  if (unit.repair > 0 && hull < MAX_HULL) {
    value += unit.repair * 3;
  }

  if (unit.role === "medic") {
    value += 14;
  }

  if (unit.role === "engineer" && hull < MAX_HULL) {
    value += 12;
  }

  return value;
}

function getAlienAttackScore(alien: Unit, target: Unit, hull: number) {
  const damage = clampDamage(alien.attack - target.armor);
  let score = damage * 8 + getCrewTargetValue(target, hull);

  if (damage >= target.hp) {
    score += 100;
  } else {
    score += Math.round((1 - target.hp / target.maxHp) * 30);
  }

  return score;
}

function getAlienHullScore(alien: Unit, hull: number, zone: ZoneId) {
  const damage = getAlienHullDamage(alien, zone);
  let score = damage * 9 + Math.round((1 - hull / MAX_HULL) * 20);

  if (damage >= hull) {
    score += 180;
  }

  if (alien.role === "siege") {
    score += 20;
  }

  return score;
}

function getAlienTurn(alien: Unit, crew: Unit[], aliens: Unit[], hull: number): AlienTurn {
  const alienPosition: Position = { zone: alien.zone, rank: alien.rank };
  const reachablePositions = boardPositions.filter((position) => {
    const occupants = aliens.filter((unit) => unit.id !== alien.id && unit.zone === position.zone && unit.rank === position.rank);

    if (occupants.length >= 2) {
      return false;
    }

    return getMovementDistance(alienPosition, position) <= alien.speed;
  });
  let bestTurn: AlienTurn = {
    zone: alien.zone,
    rank: alien.rank,
    targetId: null,
    attacksHull: false,
    score: Number.NEGATIVE_INFINITY,
  };

  for (const position of reachablePositions) {
    let positionScore = Number.NEGATIVE_INFINITY;
    let targetId: string | null = null;
    let attacksHull = false;

    for (const target of crew) {
      if (canAttackFromPosition(alien, position, target)) {
        const attackScore = getAlienAttackScore(alien, target, hull);

        if (attackScore > positionScore) {
          positionScore = attackScore;
          targetId = target.id;
          attacksHull = false;
        }
      }
    }

    const coreDistance = getZoneIndex(position.zone);
    const siegeReach = Math.max(0, alien.range - 1);
    const hullDamage = getAlienHullDamage(alien, position.zone);

    if (coreDistance <= siegeReach && hullDamage > 0) {
      const hullScore = getAlienHullScore(alien, hull, position.zone);

      if (hullScore > positionScore) {
        positionScore = hullScore;
        targetId = null;
        attacksHull = true;
      }
    }

    if (positionScore === Number.NEGATIVE_INFINITY) {
      const targetApproachScores = crew.map((target) => {
        let distance = getDistanceFromPosition(position, target);

        if (target.rank === "rear" && alien.range <= 1) {
          const attackPosition: Position = { zone: target.zone, rank: "front" };
          distance = getMovementDistance(position, attackPosition);
        }

        return getCrewTargetValue(target, hull) - distance * 12;
      });
      const bestTargetApproach = Math.max(...targetApproachScores);
      const siegeApproach = alien.siege * 5 - getZoneHullDefense(position.zone) * 4 - coreDistance * 10;
      positionScore = Math.max(bestTargetApproach, siegeApproach);
    }

    const movementCost = getMovementDistance(alienPosition, position);
    positionScore -= movementCost * 0.01;

    if (positionScore > bestTurn.score) {
      bestTurn = {
        zone: position.zone,
        rank: position.rank,
        targetId,
        attacksHull,
        score: positionScore,
      };
    }
  }

  return bestTurn;
}

function getEasyAlienTurn(alien: Unit, crew: Unit[], aliens: Unit[]): AlienTurn {
  const targets = crew
    .filter((unit) => canAttackUnit(alien, unit))
    .sort((left, right) => left.hp - right.hp);

  if (targets[0]) {
    return {
      zone: alien.zone,
      rank: alien.rank,
      targetId: targets[0].id,
      attacksHull: false,
      score: 0,
    };
  }

  const coreDistance = getZoneIndex(alien.zone);
  const siegeReach = Math.max(0, alien.range - 1);

  if (coreDistance <= siegeReach && getAlienHullDamage(alien, alien.zone) > 0) {
    return {
      zone: alien.zone,
      rank: alien.rank,
      targetId: null,
      attacksHull: true,
      score: 0,
    };
  }

  let targetPosition: Position = { zone: alien.zone, rank: alien.rank };

  if (alien.rank === "rear") {
    targetPosition = { zone: alien.zone, rank: "front" };
  } else if (coreDistance > 0) {
    targetPosition = { zone: zoneOrder[coreDistance - 1], rank: "front" };
  }

  const occupants = aliens.filter((unit) => unit.id !== alien.id && unit.zone === targetPosition.zone && unit.rank === targetPosition.rank);

  if (occupants.length >= 2) {
    targetPosition = { zone: alien.zone, rank: alien.rank };
  }

  return {
    ...targetPosition,
    targetId: null,
    attacksHull: false,
    score: 0,
  };
}

function getBoardTabClass(tabDifficulty: Difficulty, currentDifficulty: Difficulty) {
  if (tabDifficulty === currentDifficulty) {
    return "rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-left text-blue-800 shadow-sm transition";
  }

  return "rounded-lg border border-transparent px-3 py-2 text-left text-slate-500 transition hover:border-slate-200 hover:bg-white";
}

function getNextLogId(log: LogEntry[]) {
  if (log.length === 0) {
    return 1;
  }

  return log[0].id + 1;
}

function groupLogEntries(entries: LogEntry[]) {
  const sortedEntries = [...entries].sort((left, right) => right.id - left.id);
  const groups: LogGroup[] = [];

  for (const entry of sortedEntries) {
    const currentGroup = groups[groups.length - 1];

    if (!currentGroup || currentGroup.shift !== entry.shift) {
      groups.push({ shift: entry.shift, entries: [entry] });
      continue;
    }

    currentGroup.entries.push(entry);
  }

  return groups;
}

function getToneClass(tone: LogTone) {
  if (tone === "good") {
    return "text-emerald-700";
  }

  if (tone === "bad") {
    return "text-rose-700";
  }

  if (tone === "critical") {
    return "font-semibold text-rose-900";
  }

  return "text-slate-600";
}

function getLogEntryClass(tone: LogTone) {
  if (tone === "critical") {
    return "rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs leading-5 shadow-sm";
  }

  return "rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs leading-5";
}

function getHealthClass(hp: number, maxHp: number) {
  const ratio = hp / maxHp;

  if (ratio > 0.6) {
    return "bg-emerald-500";
  }

  if (ratio > 0.3) {
    return "bg-amber-500";
  }

  return "bg-rose-500";
}

function getRoleLabel(role: Unit["role"]) {
  if (role === "assault") {
    return "Штурм";
  }

  if (role === "medic") {
    return "Медик";
  }

  if (role === "engineer") {
    return "Инженер";
  }

  if (role === "ranger") {
    return "Стрелок";
  }

  if (role === "hybrid") {
    return "Гибрид";
  }

  if (role === "hunter") {
    return "Охотник";
  }

  if (role === "tank") {
    return "Броневик";
  }

  if (role === "shooter") {
    return "Стрелок";
  }

  return "Разрушитель";
}

function getRoleClass(role: Unit["role"]) {
  if (role === "medic") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (role === "engineer") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (role === "ranger") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (role === "hunter" || role === "tank" || role === "shooter" || role === "siege") {
    return "border-rose-300 bg-rose-50 text-rose-800";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function getZoneName(zoneId: ZoneId) {
  const zone = zones.find((item) => item.id === zoneId);

  if (!zone) {
    return zoneId;
  }

  return zone.shortName;
}

function getRankLabel(rank: Rank) {
  if (rank === "front") {
    return "Передовая";
  }

  return "Тыл";
}

function getRankHint(rank: Rank) {
  if (rank === "front") {
    return "Ближе к контакту: удобнее закрывать проход и бить в упор.";
  }

  return "На шаг дальше от контакта: безопаснее для медиков, стрелков и инженеров.";
}

function getActionStatusClass(unit: Unit) {
  if (unit.hasActed) {
    return "border-slate-200 bg-slate-100 text-slate-400";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getMoveStatusClass(unit: Unit) {
  if (unit.hasMoved) {
    return "border-slate-200 bg-slate-100 text-slate-400";
  }

  return "border-cyan-200 bg-cyan-50 text-cyan-700";
}

function getActionStatusLabel(unit: Unit) {
  if (unit.hasActed) {
    return "ACT used";
  }

  return "ACT ready";
}

function getMoveStatusLabel(unit: Unit) {
  if (unit.hasMoved) {
    return "MOVE used";
  }

  return "MOVE ready";
}

function getRepairAmount(unit: Unit) {
  if (unit.repair <= 0) {
    return 0;
  }

  if (unit.zone === "reactor" || unit.zone === "breach") {
    return unit.repair;
  }

  return Math.max(1, Math.ceil(unit.repair / 2));
}

function UnitCard({
  unit,
  selected,
  canAttack,
  attackDamage,
  canHeal,
  healAmount,
  canRepair,
  repairAmount,
  onSelect,
  onAttack,
  onHeal,
  onRepair,
}: {
  unit: Unit;
  selected: boolean;
  canAttack: boolean;
  attackDamage: number;
  canHeal: boolean;
  healAmount: number;
  canRepair: boolean;
  repairAmount: number;
  onSelect: () => void;
  onAttack: () => void;
  onHeal: () => void;
  onRepair: () => void;
}) {
  let cardClass = "rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition";

  if (unit.team === "alien") {
    cardClass = "rounded-2xl border border-rose-200 bg-white p-3 shadow-sm transition";
  }

  if (selected) {
    cardClass = "rounded-2xl border border-slate-950 bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition";
  }

  cardClass = `${cardClass} unit-card`;

  let actionButton = null;

  if (unit.team === "alien" && canAttack) {
    actionButton = (
      <button
        className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        onClick={onAttack}
        type="button"
      >
        Атаковать −{attackDamage}
      </button>
    );
  }

  if (unit.team === "crew" && canHeal) {
    actionButton = (
      <button
        className="mt-3 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
        onClick={onHeal}
        type="button"
      >
        Лечить +{healAmount}
      </button>
    );
  }

  return (
    <div className={cardClass}>
      <button className="w-full text-left" onClick={onSelect} type="button">
        <div className="flex flex-col gap-1.5">
          <div className="min-w-0 pr-1">
            <p className="break-words text-sm font-semibold tracking-[-0.02em] text-slate-950">{unit.name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{unit.title}</p>
          </div>
          <span className={`w-fit max-w-full rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${getRoleClass(unit.role)}`}>
            {getRoleLabel(unit.role)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-slate-500">
          <span>HP {unit.hp}/{unit.maxHp}</span>
          <span>ATK {unit.attack} · RNG {unit.range} · SPD {unit.speed}</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
          <div
            className={`h-1.5 rounded-full ${getHealthClass(unit.hp, unit.maxHp)}`}
            style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
          />
        </div>

        {unit.team === "crew" && (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <span className={`rounded-lg border px-2 py-1 text-center text-[9px] font-bold uppercase ${getActionStatusClass(unit)}`}>
              {getActionStatusLabel(unit)}
            </span>
            <span className={`rounded-lg border px-2 py-1 text-center text-[9px] font-bold uppercase ${getMoveStatusClass(unit)}`}>
              {getMoveStatusLabel(unit)}
            </span>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1 text-[10px] text-slate-500">
          <span className="rounded-md bg-slate-100 px-1.5 py-1">ARM {unit.armor}</span>
          {unit.team === "crew" && <span className="rounded-md bg-cyan-50 px-1.5 py-1 text-cyan-700">SPD {unit.speed}</span>}
          {unit.heal > 0 && <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-emerald-700">MED {unit.heal}</span>}
          {unit.repair > 0 && <span className="rounded-md bg-amber-50 px-1.5 py-1 text-amber-700">ENG {unit.repair}</span>}
          {unit.siege > 0 && <span className="rounded-md bg-rose-50 px-1.5 py-1 text-rose-700">HULL {unit.siege}</span>}
        </div>
      </button>
      {actionButton}
      {selected && unit.team === "crew" && unit.repair > 0 && (
        <button
          className="mt-2 w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          disabled={!canRepair}
          onClick={onRepair}
          type="button"
        >
          Ремонт +{repairAmount}
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [units, setUnits] = useState<Unit[]>(initialScenario.units);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [selectedId, setSelectedId] = useState(initialScenario.units[0].id);
  const [shift, setShift] = useState(1);
  const [hull, setHull] = useState(MAX_HULL);
  const [scenarioSeed, setScenarioSeed] = useState(initialScenario.seed);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  const crew = units.filter((unit) => unit.team === "crew" && unit.hp > 0);
  const aliens = units.filter((unit) => unit.team === "alien" && unit.hp > 0);
  const selectedUnit = crew.find((unit) => unit.id === selectedId);

  let gameState = "active";

  if (aliens.length === 0) {
    gameState = "won";
  } else if (hull <= 0 || crew.length === 0) {
    gameState = "lost";
  }

  function addLog(text: string, tone: LogTone) {
    setLogEntries((current) => {
      const entry: LogEntry = { id: getNextLogId(current), shift, text, tone };
      return [entry, ...current].slice(0, 12);
    });
  }

  function updateUnits(nextUnits: Unit[]) {
    const aliveUnits = nextUnits.filter((unit) => unit.hp > 0);
    const aliveCrew = aliveUnits.filter((unit) => unit.team === "crew");
    const selectionStillAlive = aliveCrew.some((unit) => unit.id === selectedId);

    setUnits(aliveUnits);

    if (selectionStillAlive) {
      return;
    }

    if (aliveCrew[0]) {
      setSelectedId(aliveCrew[0].id);
      return;
    }

    setSelectedId("");
  }

  function canUseSelectedUnit() {
    if (gameState !== "active") {
      return false;
    }

    if (!selectedUnit) {
      addLog("Сначала выбери живую карточку экипажа.", "bad");
      return false;
    }

    return true;
  }

  function canUseSelectedAction() {
    if (!canUseSelectedUnit() || !selectedUnit) {
      return false;
    }

    if (selectedUnit.hasActed) {
      addLog(`${selectedUnit.name} уже использовал рабочее действие в этой смене.`, "bad");
      return false;
    }

    return true;
  }

  function markSelectedActionUsed(nextUnits: Unit[]) {
    return nextUnits.map((unit) => {
      if (unit.id !== selectedId) {
        return unit;
      }

      return { ...unit, hasActed: true };
    });
  }

  function markSelectedMoveUsed(nextUnits: Unit[]) {
    return nextUnits.map((unit) => {
      if (unit.id !== selectedId) {
        return unit;
      }

      return { ...unit, hasMoved: true };
    });
  }

  function moveSelected(targetZone: ZoneId, targetRank: Rank) {
    if (!canUseSelectedUnit() || !selectedUnit) {
      return;
    }

    if (selectedUnit.hasMoved) {
      addLog(`${selectedUnit.name} уже перемещался в этой смене.`, "bad");
      return;
    }

    if (!canMoveToPosition(selectedUnit, targetZone, targetRank)) {
      addLog(`${selectedUnit.name} не достает до этой клетки. SPD ${selectedUnit.speed}.`, "bad");
      return;
    }

    const occupants = crew.filter((unit) => unit.zone === targetZone && unit.rank === targetRank);

    if (occupants.length >= 2) {
      addLog("В ячейке уже две карточки экипажа. Сначала освободи место.", "bad");
      return;
    }

    const nextUnits = units.map((unit) => {
      if (unit.id !== selectedUnit.id) {
        return unit;
      }

      return { ...unit, zone: targetZone, rank: targetRank };
    });

    updateUnits(markSelectedMoveUsed(nextUnits));
    addLog(`${selectedUnit.name} перемещен на ${getPositionDistance(selectedUnit, targetZone, targetRank)}: ${getZoneName(targetZone)} / ${getRankLabel(targetRank)}.`, "neutral");
  }

  function attackAlien(targetId: string) {
    if (!canUseSelectedAction() || !selectedUnit) {
      return;
    }

    const target = aliens.find((unit) => unit.id === targetId);

    if (target && target.rank === "rear" && selectedUnit.range <= 1 && !canAttackUnit(selectedUnit, target)) {
      addLog("С RNG 1 тыл можно атаковать только с передовой того же отсека. Из соседнего тыла нужен RNG 2.", "bad");
      return;
    }

    if (!target || !canAttackUnit(selectedUnit, target)) {
      addLog("Цель находится вне радиуса выбранной карты.", "bad");
      return;
    }

    const damage = clampDamage(selectedUnit.attack - target.armor);
    const nextUnits = units.map((unit) => {
      if (unit.id !== target.id) {
        return unit;
      }

      return { ...unit, hp: Math.max(0, unit.hp - damage) };
    });

    updateUnits(markSelectedActionUsed(nextUnits));

    if (target.hp - damage <= 0) {
      addLog(`${selectedUnit.name} закрывает угрозу ${target.name}.`, "good");
      return;
    }

    addLog(`${selectedUnit.name} наносит ${damage} урона по ${target.name}.`, "good");
  }

  function healCrew(targetId: string) {
    if (!canUseSelectedAction() || !selectedUnit) {
      return;
    }

    const target = crew.find((unit) => unit.id === targetId);

    if (!target || selectedUnit.heal <= 0) {
      addLog("У выбранной карты нет медицинского навыка.", "bad");
      return;
    }

    if (getDistance(selectedUnit, target) > 1) {
      addLog("Для лечения карты должны стоять рядом.", "bad");
      return;
    }

    if (target.hp >= target.maxHp) {
      addLog(`${target.name} не нуждается в лечении.`, "neutral");
      return;
    }

    const healed = Math.min(selectedUnit.heal, target.maxHp - target.hp);
    const nextUnits = units.map((unit) => {
      if (unit.id !== target.id) {
        return unit;
      }

      return { ...unit, hp: unit.hp + healed };
    });

    updateUnits(markSelectedActionUsed(nextUnits));
    addLog(`${selectedUnit.name} восстанавливает ${healed} HP у ${target.name}.`, "good");
  }

  function repairHull(unitId: string) {
    if (gameState !== "active") {
      return;
    }

    const repairer = crew.find((unit) => unit.id === unitId);

    if (!repairer) {
      addLog("Инженерная карта больше недоступна.", "bad");
      return;
    }

    if (repairer.hasActed) {
      addLog(`${repairer.name} уже использовал рабочее действие в этой смене.`, "bad");
      return;
    }

    const repairAmount = getRepairAmount(repairer);

    if (repairAmount <= 0) {
      addLog("У этой карты нет инженерного навыка.", "bad");
      return;
    }

    if (hull >= MAX_HULL) {
      addLog("Обшивка уже полностью восстановлена.", "neutral");
      return;
    }

    const restored = Math.min(repairAmount, MAX_HULL - hull);
    setHull((current) => Math.min(MAX_HULL, current + repairAmount));
    const nextUnits = units.map((unit) => {
      if (unit.id !== repairer.id) {
        return unit;
      }

      return { ...unit, hasActed: true };
    });
    updateUnits(nextUnits);
    addLog(`${repairer.name} возвращает кораблю ${restored} прочности.`, "good");
  }

  function endShift() {
    if (gameState !== "active") {
      return;
    }

    let nextUnits = [...units];
    let hullDamage = 0;
    let nextLogId = getNextLogId(logEntries);
    const messages: LogEntry[] = [];
    const actingAliens = sortUnits(aliens);

    for (const alien of actingAliens) {
      const currentAlien = nextUnits.find((unit) => unit.id === alien.id);

      if (!currentAlien) {
        continue;
      }

      const currentCrew = nextUnits.filter((unit) => unit.team === "crew" && unit.hp > 0);
      const currentAliens = nextUnits.filter((unit) => unit.team === "alien" && unit.hp > 0);

      if (currentCrew.length === 0) {
        break;
      }

      let turn: AlienTurn;

      if (difficulty === "easy") {
        turn = getEasyAlienTurn(currentAlien, currentCrew, currentAliens);
      } else {
        turn = getAlienTurn(currentAlien, currentCrew, currentAliens, Math.max(0, hull - hullDamage));
      }

      const moved = turn.zone !== currentAlien.zone || turn.rank !== currentAlien.rank;
      nextUnits = nextUnits.map((unit) => {
        if (unit.id !== currentAlien.id) {
          return unit;
        }

        return { ...unit, zone: turn.zone, rank: turn.rank };
      });

      if (turn.targetId) {
        const target = currentCrew.find((unit) => unit.id === turn.targetId);

        if (!target) {
          continue;
        }

        const damage = clampDamage(currentAlien.attack - target.armor);
        nextUnits = nextUnits.map((unit) => {
          if (unit.id !== target.id) {
            return unit;
          }

          return { ...unit, hp: Math.max(0, unit.hp - damage) };
        });
        let movementText = "";

        if (moved) {
          movementText = ` после маневра в ${getZoneName(turn.zone)} / ${getRankLabel(turn.rank)}`;
        }

        messages.push({
          id: nextLogId,
          shift,
          text: `${currentAlien.name}${movementText} наносит ${damage} урона по ${target.name}.`,
          tone: "bad",
        });
        nextLogId += 1;

        if (target.hp - damage <= 0) {
          messages.push({
            id: nextLogId,
            shift,
            text: `${target.name} погибает. Экипаж потерял специалиста «${target.title}».`,
            tone: "critical",
          });
          nextLogId += 1;
        }

        continue;
      }

      if (turn.attacksHull) {
        const damage = getAlienHullDamage(currentAlien, turn.zone);
        const defense = getZoneHullDefense(turn.zone);
        hullDamage += damage;
        let movementText = "";

        if (moved) {
          movementText = ` из ${getZoneName(turn.zone)} / ${getRankLabel(turn.rank)}`;
        }

        messages.push({
          id: nextLogId,
          shift,
          text: `${currentAlien.name}${movementText} атакует корабль: −${damage} к обшивке (защита ${defense}).`,
          tone: "bad",
        });
        nextLogId += 1;
        continue;
      }

      messages.push({
        id: nextLogId,
        shift,
        text: `${currentAlien.name} занимает выгодную позицию: ${getZoneName(turn.zone)} / ${getRankLabel(turn.rank)}.`,
        tone: "neutral",
      });
      nextLogId += 1;
    }

    const refreshedUnits = nextUnits.map((unit) => {
      if (unit.team !== "crew") {
        return unit;
      }

      return { ...unit, hasActed: false, hasMoved: false };
    });

    updateUnits(refreshedUnits);
    setHull((current) => Math.max(0, current - hullDamage));
    setShift((current) => current + 1);
    setLogEntries((current) => {
      const nextEntries = [...messages, ...current];
      return nextEntries.sort((left, right) => right.id - left.id).slice(0, 12);
    });
  }

  function resetBoard(nextDifficulty: Difficulty) {
    const seed = Math.floor(Date.now() + Math.random() * 100000);
    const scenario = generateScenario(seed, nextDifficulty);
    const firstCrew = scenario.units.find((unit) => unit.team === "crew");

    setUnits(scenario.units);
    setDifficulty(nextDifficulty);
    setScenarioSeed(seed);
    setShift(1);
    setHull(MAX_HULL);
    setLogEntries([]);

    if (firstCrew) {
      setSelectedId(firstCrew.id);
    }
  }

  function createNewBoard() {
    resetBoard(difficulty);
  }

  function changeDifficulty(nextDifficulty: Difficulty) {
    if (nextDifficulty === difficulty) {
      return;
    }

    resetBoard(nextDifficulty);
  }

  const totalAttack = crew.reduce((sum, unit) => sum + unit.attack, 0);
  const totalHeal = crew.reduce((sum, unit) => sum + unit.heal, 0);
  const totalRepair = crew.reduce((sum, unit) => sum + unit.repair, 0);
  const totalEnemyAttack = aliens.reduce((sum, unit) => sum + unit.attack, 0);
  const totalEnemyArmor = aliens.reduce((sum, unit) => sum + unit.armor, 0);
  const totalEnemySiege = aliens.reduce((sum, unit) => sum + unit.siege, 0);
  const readyActions = crew.filter((unit) => !unit.hasActed).length;
  const readyMoves = crew.filter((unit) => !unit.hasMoved).length;
  const logGroups = groupLogEntries(logEntries);
  let visibleZones = zones;
  let visibleRanks = ranks;
  let boardGridClass = "grid min-w-[1120px] grid-cols-4 gap-3";

  if (difficulty === "easy") {
    visibleZones = zones.filter((zone) => zone.id !== "breach");
    visibleRanks = ["front"];
    boardGridClass = "grid min-w-[840px] grid-cols-3 gap-3";
  }

  let gameMessage = null;

  if (gameState === "won") {
    gameMessage = (
      <section className="flex flex-col gap-3 rounded-[22px] border border-emerald-300 bg-emerald-50 p-4 shadow-[0_12px_36px_rgba(5,150,105,0.12)] sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Mission complete</p><p className="mt-1 text-base font-semibold text-emerald-950">Все угрозы закрыты. Станция удержана.</p></div>
        <button className="w-fit rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600" onClick={createNewBoard} type="button">Новая доска</button>
      </section>
    );
  }

  if (gameState === "lost") {
    gameMessage = (
      <section className="flex flex-col gap-3 rounded-[22px] border border-rose-300 bg-rose-50 p-4 shadow-[0_12px_36px_rgba(225,29,72,0.12)] sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">Mission failed</p><p className="mt-1 text-base font-semibold text-rose-950">Оборона сломана. Попробуй иначе распределить роли и позиции.</p></div>
        <button className="w-fit rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600" onClick={createNewBoard} type="button">Новая доска</button>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f4f7fb,_#e7edf5_45%,_#d9e2ef)] px-3 py-4 text-slate-900 sm:px-5 lg:px-7" data-theme-surface>
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
        <section className="rounded-[26px] border border-slate-200 bg-white/85 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Station Desk</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Shift {shift}</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[10px] text-slate-400">BOARD-{String(scenarioSeed).slice(-5)}</span>
              <Link className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 transition hover:bg-blue-100" href="/rules">Правила</Link>
              <ThemeToggle />
            </div>
            <div className="mt-4 flex w-fit flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
              <span className="px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Boards</span>
              <button aria-pressed={difficulty === "easy"} className={getBoardTabClass("easy", difficulty)} onClick={() => changeDifficulty("easy")} type="button"><span className="block text-[10px] font-bold uppercase tracking-[0.12em]">Routine</span><span className="mt-0.5 block text-[9px] opacity-70">L1 · Standard queue</span></button>
              <button aria-pressed={difficulty === "medium"} className={getBoardTabClass("medium", difficulty)} onClick={() => changeDifficulty("medium")} type="button"><span className="block text-[10px] font-bold uppercase tracking-[0.12em]">Incident</span><span className="mt-0.5 block text-[9px] opacity-70">L2 · Priority queue</span></button>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl">Internal Defense Workflow</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Тактическая доска станции: сближай карточки, держи линию, лечи экипаж и ремонтируй корабль до конца смены.</p>
          </div>
        </section>

        {gameMessage}

        <div className="grid gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:self-start xl:overflow-y-auto xl:pr-1 [scrollbar-gutter:stable]">
            <section className="rounded-[26px] border border-slate-200 bg-white/85 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.07)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Operations Summary</p><h2 className="mt-1 text-lg font-semibold text-slate-950">Состояние смены</h2></div>
                <button className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={createNewBoard} type="button">New board</button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ready</p><p className="mt-1 text-xl font-semibold">{readyActions}/{readyMoves}</p><p className="text-[9px] text-slate-400">ACT / MOVE</p></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Hull</p><p className="mt-1 text-xl font-semibold">{hull}/{MAX_HULL}</p></div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Crew</p><p className="mt-1 text-xl font-semibold">{crew.length}</p></div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-rose-500">Threats</p><p className="mt-1 text-xl font-semibold text-rose-700">{aliens.length}</p></div>
              </div>

              <button className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:bg-slate-300" disabled={gameState !== "active"} onClick={endShift} type="button">End shift</button>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between gap-2 text-[10px]"><p className="font-bold uppercase tracking-[0.18em] text-slate-500">Экипаж</p><p className="text-right text-slate-500">ATK {totalAttack} · MED {totalHeal} · ENG {totalRepair}</p></div>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100"><div className="bg-slate-700" style={{ flexBasis: 0, flexGrow: totalAttack }} /><div className="bg-emerald-500" style={{ flexBasis: 0, flexGrow: totalHeal }} /><div className="bg-amber-500" style={{ flexBasis: 0, flexGrow: totalRepair }} /></div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-400"><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-700" />ATK</span><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />MED</span><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />ENG</span></div>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between gap-2 text-[10px]"><p className="font-bold uppercase tracking-[0.18em] text-rose-600">Пришельцы</p><p className="text-right text-slate-500">ATK {totalEnemyAttack} · ARM {totalEnemyArmor} · HULL {totalEnemySiege}</p></div>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100"><div className="bg-rose-500" style={{ flexBasis: 0, flexGrow: totalEnemyAttack }} /><div className="bg-slate-500" style={{ flexBasis: 0, flexGrow: totalEnemyArmor }} /><div className="bg-red-700" style={{ flexBasis: 0, flexGrow: totalEnemySiege }} /></div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-400"><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />ATK</span><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-500" />ARM</span><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-700" />HULL</span></div>
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white/85 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.07)] backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Activity Feed</p>
              <div className="mt-3 max-h-[430px] space-y-4 overflow-y-auto pr-1">
                {logGroups.map((group) => (
                  <div key={group.shift}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Смена {group.shift}</span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      {group.entries.map((entry) => <div className={getLogEntryClass(entry.tone)} key={entry.id}><p className={getToneClass(entry.tone)}>{entry.text}</p></div>)}
                    </div>
                  </div>
                ))}
                {logGroups.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-xs leading-5 text-slate-400">Журнал новой партии пуст. Первое действие появится здесь.</div>}
              </div>
            </section>
          </aside>

          <section className="min-w-0 rounded-[26px] border border-slate-200 bg-white/85 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.07)] backdrop-blur">
            <div className="border-b border-slate-200 pb-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Board View · Core ← Boarding route</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em]">Station sectors</h2></div>
            </div>

            <div className="mt-4 overflow-x-auto pb-2">
              <div className={boardGridClass}>
                {visibleZones.map((zone) => (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50/80" key={zone.id}>
                    <div className="border-b border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${zone.accent}`} /><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{zone.shortName}</p><span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-500">DEF {zone.hullDefense}</span></div><span className="rounded-full bg-white px-2 py-1 text-[10px] text-slate-400">{units.filter((unit) => unit.zone === zone.id).length} cards</span></div>
                      <h3 className="mt-2 font-semibold text-slate-950">{zone.name}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{zone.description}</p>
                    </div>

                    {visibleRanks.map((rank) => {
                      const cellCrew = sortUnits(crew.filter((unit) => unit.zone === zone.id && unit.rank === rank));
                      const cellAliens = sortUnits(aliens.filter((unit) => unit.zone === zone.id && unit.rank === rank));
                      let cellClass = "border-t border-slate-200 p-3 first:border-t-0";

                      if (rank === "front") {
                        cellClass = "p-3";
                      }

                      return (
                        <div className={cellClass} key={rank}>
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{getRankLabel(rank)}</p>
                              <p className="mt-0.5 min-h-8 text-[10px] leading-4 text-slate-400">{getRankHint(rank)}</p>
                            </div>
                            <button className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 hover:border-slate-400 disabled:opacity-35" disabled={!selectedUnit || selectedUnit.hasMoved || !canMoveToPosition(selectedUnit, zone.id, rank)} onClick={() => moveSelected(zone.id, rank)} type="button">Move here</button>
                          </div>
                          <div className="grid min-h-[100px] grid-cols-2 gap-2">
                            <div className="space-y-2">
                              {cellCrew.map((unit) => {
                                let canHeal = false;
                                let canRepair = false;
                                let healAmount = 0;
                                const unitRepairAmount = getRepairAmount(unit);
                                if (selectedUnit && !selectedUnit.hasActed && selectedUnit.heal > 0 && unit.hp < unit.maxHp && getDistance(selectedUnit, unit) <= 1 && selectedUnit.id !== unit.id) {
                                  canHeal = true;
                                  healAmount = Math.min(selectedUnit.heal, unit.maxHp - unit.hp);
                                }

                                if (!unit.hasActed && unitRepairAmount > 0 && hull < MAX_HULL && gameState === "active") {
                                  canRepair = true;
                                }

                                return <UnitCard attackDamage={0} canAttack={false} canHeal={canHeal} canRepair={canRepair} healAmount={healAmount} key={unit.id} onAttack={() => undefined} onHeal={() => healCrew(unit.id)} onRepair={() => repairHull(unit.id)} onSelect={() => setSelectedId(unit.id)} repairAmount={unitRepairAmount} selected={selectedId === unit.id} unit={unit} />;
                              })}
                              {cellCrew.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-3 text-[10px] leading-4 text-slate-400">Crew slot</div>}
                            </div>
                            <div className="space-y-2">
                              {cellAliens.map((unit) => {
                                let canAttack = false;
                                let attackDamage = 0;
                                if (selectedUnit && !selectedUnit.hasActed && canAttackUnit(selectedUnit, unit)) {
                                  canAttack = true;
                                  attackDamage = clampDamage(selectedUnit.attack - unit.armor);
                                }

                                return <UnitCard attackDamage={attackDamage} canAttack={canAttack} canHeal={false} canRepair={false} healAmount={0} key={unit.id} onAttack={() => attackAlien(unit.id)} onHeal={() => undefined} onRepair={() => undefined} onSelect={() => undefined} repairAmount={0} selected={false} unit={unit} />;
                              })}
                              {cellAliens.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-3 text-[10px] leading-4 text-slate-400">Threat slot</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
