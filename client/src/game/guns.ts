import * as THREE from "three";
import { PAINT_PISTOL, PAINT_REVOLVER, PAINT_RIFLE, PAINT_SHOTGUN, PAINT_SMG, PAINT_SNIPER } from "./blocks";

export type TeamId = "paint" | "painter";

export const TEAM_NAME: Record<TeamId, string> = {
  paint: "Team Paint",
  painter: "Team Painter",
};

export const TEAM_COLOR: Record<TeamId, number> = {
  paint: 0x2f9bff,
  painter: 0xff3d8a,
};

export function otherTeam(t: TeamId): TeamId {
  return t === "paint" ? "painter" : "paint";
}

export interface GunDef {
  id: number;
  name: string;
  mag: number;
  /** Seconds to refill the magazine. */
  reload: number;
  /** Seconds between shots. */
  fire: number;
  /** Hold to keep firing. Shotgun and pistol fire once per press. */
  auto: boolean;
  /** Buckshot count. The shotgun sends several pellets in one trigger pull. */
  pellets: number;
  spread: number;
  speed: number;
  dmg: number;
  gravity: number;
  life: number;
  color: number;
}

export const GUNS: GunDef[] = [
  { id: PAINT_PISTOL, name: "Paint Pistol", mag: 10, reload: 1.15, fire: 0.32, auto: false, pellets: 1, spread: 0.012, speed: 48, dmg: 6, gravity: 1.5, life: 1.1, color: 0x3ec1ff },
  { id: PAINT_SHOTGUN, name: "Paint Shotgun", mag: 6, reload: 1.9, fire: 0.7, auto: false, pellets: 8, spread: 0.09, speed: 44, dmg: 3, gravity: 2.2, life: 0.85, color: 0xff5a3c },
  { id: PAINT_RIFLE, name: "Paint Assault Rifle", mag: 30, reload: 1.85, fire: 0.11, auto: true, pellets: 1, spread: 0.038, speed: 60, dmg: 4, gravity: 0.8, life: 1.15, color: 0xffd23a },
  { id: PAINT_SMG, name: "Paint SMG", mag: 28, reload: 1.35, fire: 0.065, auto: true, pellets: 1, spread: 0.07, speed: 50, dmg: 2, gravity: 1.4, life: 0.85, color: 0x7dff6a },
  { id: PAINT_SNIPER, name: "Paint Sniper", mag: 4, reload: 2.7, fire: 1.2, auto: false, pellets: 1, spread: 0.002, speed: 92, dmg: 10, gravity: 0.2, life: 1.6, color: 0xc084fc },
  { id: PAINT_REVOLVER, name: "Paint Revolver", mag: 6, reload: 1.55, fire: 0.48, auto: false, pellets: 1, spread: 0.008, speed: 58, dmg: 7, gravity: 0.9, life: 1.25, color: 0xfb923c },
];

export function gunOf(id: number): GunDef | null {
  return GUNS.find((g) => g.id === id) ?? null;
}

export interface PaintBall {
  mesh: THREE.Mesh;
  pos: { x: number; y: number; z: number };
  vel: { x: number; y: number; z: number };
  life: number;
  dmg: number;
  gravity: number;
  color: number;
  /** Enemy paint hurts the local player. Player paint hurts mobs and the other team. */
  hostile: boolean;
  /** Seen by other players. Does not deal damage; the shooter already did. */
  visual: boolean;
  shot: number;
}

const geo = new THREE.SphereGeometry(0.1, 6, 4);
const mats = new Map<number, THREE.MeshBasicMaterial>();

function paintMat(color: number) {
  let m = mats.get(color);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color });
    mats.set(color, m);
  }
  return m;
}

let shotSerial = 1;
export function nextShot() {
  shotSerial = (shotSerial + 1) >>> 0;
  return shotSerial;
}

export function jitterDir(dx: number, dy: number, dz: number, spread: number) {
  const x = dx + (Math.random() - 0.5) * spread * 2;
  const y = dy + (Math.random() - 0.5) * spread * 2;
  const z = dz + (Math.random() - 0.5) * spread * 2;
  const l = Math.hypot(x, y, z) || 1;
  return { x: x / l, y: y / l, z: z / l };
}

export function spawnBall(
  from: { x: number; y: number; z: number },
  dir: { x: number; y: number; z: number },
  o: { speed: number; dmg: number; gravity: number; color: number; hostile: boolean; life: number; shot: number; visual?: boolean },
): PaintBall {
  const mesh = new THREE.Mesh(geo, paintMat(o.color));
  mesh.position.set(from.x, from.y, from.z);
  return {
    mesh,
    pos: { x: from.x, y: from.y, z: from.z },
    vel: { x: dir.x * o.speed, y: dir.y * o.speed, z: dir.z * o.speed },
    life: o.life,
    dmg: o.dmg,
    gravity: o.gravity,
    color: o.color,
    hostile: o.hostile,
    visual: !!o.visual,
    shot: o.shot,
  };
}
