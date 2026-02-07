import { NavPoint } from '../../../providers/WebSocketContext';

export const FLIGHT_PLAN_PRESETS: Record<string, NavPoint[]> = {
  'Helsinki Local': [
    {
      ident: 'EFHK',
      type: 'large_airport',
      latitude: 60.318363,
      longitude: 24.963341,
      name: 'Helsinki-Vantaa',
    },
    {
      ident: 'EFNU',
      type: 'small_airport',
      latitude: 60.3339,
      longitude: 24.2964,
      name: 'Nummela',
    },
    { ident: 'EFNS', type: 'small_airport', latitude: 60.52, longitude: 24.831699, name: 'Salo' },
    {
      ident: 'EFHV',
      type: 'small_airport',
      latitude: 60.6544,
      longitude: 24.8811,
      name: 'Hyvinkää',
    },
  ],
  'Lapland Express': [
    {
      ident: 'EFHK',
      type: 'large_airport',
      latitude: 60.318363,
      longitude: 24.963341,
      name: 'Helsinki-Vantaa',
    },
    { ident: 'EFOU', type: 'large_airport', latitude: 64.93, longitude: 25.35, name: 'Oulu' },
    { ident: 'EFRO', type: 'large_airport', latitude: 66.56, longitude: 25.83, name: 'Rovaniemi' },
  ],
  'Archipelago Run': [
    {
      ident: 'EFHK',
      type: 'large_airport',
      latitude: 60.318363,
      longitude: 24.963341,
      name: 'Helsinki-Vantaa',
    },
    { ident: 'EFTU', type: 'large_airport', latitude: 60.51, longitude: 22.26, name: 'Turku' },
    { ident: 'EFMA', type: 'medium_airport', latitude: 60.12, longitude: 19.9, name: 'Mariehamn' },
  ],
};
