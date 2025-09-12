import candidate1001 from '@/assets/candidate-1001.jpg';
import candidate2002 from '@/assets/candidate-2002.jpg';
import candidate3003 from '@/assets/candidate-3003.jpg';
import candidate4004 from '@/assets/candidate-4004.jpg';
import candidate5005 from '@/assets/candidate-5005.jpg';

export interface Candidate {
  id: string;
  name: string;
  number: string;
  party: string;
  photo: string;
}

export const candidates: Candidate[] = [
  {
    id: "1001",
    name: "Ana Silva",
    number: "1001",
    party: "Partido Verde",
    photo: candidate1001
  },
  {
    id: "2002",
    name: "Carlos Santos",
    number: "2002", 
    party: "Partido Social",
    photo: candidate2002
  },
  {
    id: "3003",
    name: "Maria Oliveira",
    number: "3003",
    party: "Partido Popular",
    photo: candidate3003
  },
  {
    id: "4004",
    name: "João Ferreira",
    number: "4004",
    party: "Partido Liberal",
    photo: candidate4004
  },
  {
    id: "5005",
    name: "Helena Costa",
    number: "5005",
    party: "Partido Nacional",
    photo: candidate5005
  }
];

export const specialCandidates = {
  blank: {
    id: "0000",
    name: "VOTO EM BRANCO",
    number: "0000",
    party: "",
    photo: ""
  },
  null: {
    id: "9999", 
    name: "VOTO NULO",
    number: "9999",
    party: "",
    photo: ""
  }
};