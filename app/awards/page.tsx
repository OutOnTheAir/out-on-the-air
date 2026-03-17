import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const milestones = [
  { name: 'First Light', threshold: '1 activation', description: 'You left home. You made contact. You are OOTA.' },
  { name: 'Field Operator', threshold: '5 activations', description: 'The field is starting to feel familiar.' },
  { name: 'Road Warrior', threshold: '25 activations', description: 'You go out regardless of conditions.' },
  { name: 'Wanderer', threshold: '50 activations', description: 'The road is the destination.' },
  { name: 'Pathfinder', threshold: '100 activations', description: 'You have found places others never will.' },
  { name: 'Phantom', threshold: '250 activations', description: 'You appear on the bands without warning.' },
  { name: 'Nomad', threshold: '500 activations', description: 'Home is wherever the antenna goes up.' },
  { name: 'Legend', threshold: '1,000+ activations', description: 'There is nothing left to prove. You do it anyway.' },
]

const bands = ['160m', '80m', '40m', '20m', '15m', '10m', '6m']

const modes = [
  { name: 'Voice', note: 'SSB · AM · FM simplex' },
  { name: 'Fist', note: 'CW only — no phone contacts' },
]

const grids = [
  { name: 'Grid Walker', threshold: '10 unique grids' },
  { name: 'Grid Chaser', threshold: '25 unique grids' },
  { name: 'Grid Hunter', threshold: '50 unique grids' },
  { name: 'Grid Master', threshold: '100 unique grids' },
]

const dxcc = [
  { name: 'DX Initiated', threshold: '5 DXCC entities' },
  { name: 'DX Operator', threshold: '15 DXCC enti
