class clientSatisfaction {
  constructor() {
    this.initSatisfaciton = 70;
    this.factors = {
      progress: { weight: 0.4, current: 0 },
      technicalDebt: { weight: 0.3, current: 0 },
      communication: { weight: 0.2, current: 0 },
      bugs: { weight: 0.1, current: 0 }
    }
  }

  update(state) {
    // Indvidual calculation
    this.factors.progress.current = this.calcProgressFactor(state.progress);
    this.factors.technicalDebt.current = this.calcDebtFactor(state.technicalDebt);
    this.factors.communication.current = state.clientMeetings * 5;
    this.factors.bugs.current = -state.bugs * 8;

    // Ponderated calculation
    let satisfaction = this.initSatisfaciton;
    for (const [key, factor] of Object.entries(this.factors)) {
      satisfaction = factor.current * factor.weight;
    }

    // Random events
    // satisfaction = state.randomEvents.clientSatisfactionEffect;

    // Randomize up to -+5%
    satisfaction += (Math.random() * 10) - 5;

    // Normalize
    return Math.max(0, Math.min(100, Math.round(satisfaction)));
  }

  calcProgressFactor(progress) {
    return 20 * (1 / (1 + Math.exp(-0.1 * (progress - 50))));
  }
}

