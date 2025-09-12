interface VoteCount {
  [candidateNumber: string]: number;
}

class VoteStore {
  private votes: VoteCount = {
    '1001': 0,
    '2002': 0,
    '3003': 0,
    '4004': 0,
    '5005': 0,
    '0000': 0, // Branco
    '9999': 0  // Nulo
  };

  addVote(candidateNumber: string) {
    if (this.votes.hasOwnProperty(candidateNumber)) {
      this.votes[candidateNumber]++;
    } else {
      // Se for um número inválido, conta como nulo
      this.votes['9999']++;
    }
  }

  getVotes(): VoteCount {
    return { ...this.votes };
  }

  getTotalVotes(): number {
    return Object.values(this.votes).reduce((sum, count) => sum + count, 0);
  }

  reset() {
    Object.keys(this.votes).forEach(key => {
      this.votes[key] = 0;
    });
  }
}

export const voteStore = new VoteStore();