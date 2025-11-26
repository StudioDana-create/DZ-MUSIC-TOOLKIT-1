import { KeysDatabase } from './types';

export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const KEYS_DATA: KeysDatabase = {
    "C": {
        "Majeur": {
            name: "C Majeur",
            notes: ["C", "D", "E", "F", "G", "A", "B"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
            indices: [0, 2, 4, 5, 7, 9, 11]
        },
        "Mineur": {
            name: "C Mineur",
            notes: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
            indices: [0, 2, 3, 5, 7, 8, 10]
        }
    },
    "G": {
        "Majeur": {
            name: "G Majeur",
            notes: ["G", "A", "B", "C", "D", "E", "F#"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
            indices: [7, 9, 11, 0, 2, 4, 6]
        },
        "Mineur": {
            name: "G Mineur",
            notes: ["G", "A", "Bb", "C", "D", "Eb", "F"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
            indices: [7, 9, 10, 0, 2, 3, 5]
        }
    },
    "D": {
        "Majeur": {
            name: "D Majeur",
            notes: ["D", "E", "F#", "G", "A", "B", "C#"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
            indices: [2, 4, 6, 7, 9, 11, 1]
        },
        "Mineur": {
            name: "D Mineur",
            notes: ["D", "E", "F", "G", "A", "Bb", "C"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
            indices: [2, 4, 5, 7, 9, 10, 0]
        }
    },
    "A": {
        "Majeur": {
            name: "A Majeur",
            notes: ["A", "B", "C#", "D", "E", "F#", "G#"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
            indices: [9, 11, 1, 2, 4, 6, 8]
        },
        "Mineur": {
            name: "A Mineur",
            notes: ["A", "B", "C", "D", "E", "F", "G"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
            indices: [9, 11, 0, 2, 4, 5, 7]
        }
    },
    "E": {
        "Majeur": {
            name: "E Majeur",
            notes: ["E", "F#", "G#", "A", "B", "C#", "D#"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
            indices: [4, 6, 8, 9, 11, 1, 3]
        },
        "Mineur": {
            name: "E Mineur",
            notes: ["E", "F#", "G", "A", "B", "C", "D"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
            indices: [4, 6, 7, 9, 11, 0, 2]
        }
    },
    "B": {
        "Majeur": {
            name: "B Majeur",
            notes: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "4 3 2 1 4 3 2 1" },
            degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
            indices: [11, 1, 3, 4, 6, 8, 10]
        },
        "Mineur": {
            name: "B Mineur",
            notes: ["B", "C#", "D", "E", "F#", "G", "A"],
            fingering: { rh: "1 2 3 1 2 3 4 5", lh: "4 3 2 1 4 3 2 1" },
            degrees: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
            indices: [11, 1, 2, 4, 6, 7, 9]
        }
    },
    "F": {
        "Majeur": {
            name: "F Majeur",
            notes: ["F", "G", "A", "Bb", "C", "D", "E"],
            fingering: { rh: "1 2 3 4 1 2 3 4", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
            indices: [5, 7, 9, 10, 0, 2, 4]
        },
        "Mineur": {
            name: "F Mineur",
            notes: ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
            fingering: { rh: "1 2 3 4 1 2 3 4", lh: "5 4 3 2 1 3 2 1" },
            degrees: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
            indices: [5, 7, 8, 10, 0, 1, 3]
        }
    }
    // Additional keys can be added here following the same pattern
};
