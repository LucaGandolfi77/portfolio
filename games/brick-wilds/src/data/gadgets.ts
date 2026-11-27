import { BRICK_PALETTE } from './brickPalette';
import type { ModBlockId } from './types';

export interface ModBlockDef {
  id: ModBlockId;
  name: string;
  desc: string;
  costCubes: number;
  color: number;
}

export const MOD_BLOCKS: ModBlockDef[] = [
  {
    id: 'pip-magnet',
    name: 'Turbo Pip Magnet',
    desc: 'Doubles Pip pickup magnet radius.',
    costCubes: 1,
    color: BRICK_PALETTE.skyBlue,
  },
  {
    id: 'confetti-boom',
    name: 'Confetti Detonations',
    desc: 'Explosions burst into rainbow snap-blocks.',
    costCubes: 2,
    color: BRICK_PALETTE.coralPink,
  },
  {
    id: 'big-head',
    name: 'Mega-Head Heroes',
    desc: 'Classic oversized toy-figure heads!',
    costCubes: 3,
    color: BRICK_PALETTE.brightYellow,
  },
  {
    id: 'double-pips',
    name: '2x Pip Multiplier',
    desc: 'Double all Pips collected in Hub & Expeditions.',
    costCubes: 5,
    color: BRICK_PALETTE.royalPurple,
  },
];
