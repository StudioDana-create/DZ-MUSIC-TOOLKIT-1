export interface KeyData {
  name: string;
  notes: string[];
  fingering: {
    rh: string;
    lh: string;
  };
  degrees: string[];
  indices: number[];
}

export interface KeyGroup {
  Majeur: KeyData;
  Mineur?: KeyData;
}

export interface KeysDatabase {
  [key: string]: KeyGroup;
}

export interface Note {
  midi: number;
  note: string;
  octave: number;
}
