class gameState {
  constructor () {
    // Default configuration for the simulation.
    this.config = {
      init: {
        time: 100,
        budget: 50000,
        bugs: 0,
        satisfaction: 70,
        technicalDebt: 0,
        clientMeetings: 0,
        progress: 0
      }
    }
    this.resetSimulation()
  }

  /**
     * Deserialize a saved simulation state from a browser cookie.
     * @param {string} serialized Serialized simulation state.
     * @returns {SimSys} A new instance of SimSys populated with the deserialized data.
     */
  static fromCookie (serialized) {
    const sim = new SimSys()
    const data = JSON.parse(serialized)
    sim.iteration = data.iteration
    sim.config = data.config
    sim.stats = data.stats
    sim.budget = data.budget
    return sim
  }

  resetSimulation () {
    // Current iteration of the simulation
    this.iteration = 0
    // Current stats for the simulation.
    this.stats = {
      time: this.config.init.time,
      budget: this.config.init.budget,
      bugs: this.config.init.bugs,
      satisfaction: this.config.init.satisfaction,
      technicalDebt: this.config.init.technicalDebt,
      clientMeetings: this.config.init.clientMeetings,
      progress: this.config.init.progress
    }

    // Show the values in screen
    this.updateDisplays()
  }

  /**
     * Executes a single iteration of the simulation.
     * @param {number} round Precision for rounding numbers.
     * @throws {Error} When the budget allocation is invalid or system health drops to zero.
     */
  runIteration (round) {
    const s = this.stats // Current stats

    // if (b.available !== b.feature + b.bugfix + b.refactor) {
    //     throw new Error("Budget is not valid.");
    // }

    this.iteration++

    // TODO -----------------------------------------------------------------------------------

    //Update client satisfaction
    clientSatisfaction.update(this)

    // Show the values in screen
    this.updateDisplays()
  }

  /**
     * Round a number to a given precision.
     * @param {number} number Number to be rounded.
     * @param {number} precision Number of decimal places.
     * @returns {number} Rounded number.
     */
  round (number, precision) {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }

  /**
     * Serialize the current simulation state for saving as a browser cookie.
     * @returns {string} Serialized simulation state.
     */
  toString () {
    return JSON.stringify({
      iteration: this.iteration,
      stats: this.stats,
      budget: this.budget,
      config: this.config
    })
  }

  updateSum (ev) {
    const total = sliders.reduce((sum, slider) => sum + parseInt(slider.value), 0)
    if (total > 100) {
      let diff = total - 100
      for (let i = prevInputs.length - 1; i >= 0 && diff > 0; i--) {
        if (prevInputs[i] === ev.target) {
          i -= 1
        }
        const value = parseInt(prevInputs[i].value)
        if (value >= diff) {
          prevInputs[i].value = value - diff
          diff = 0
        } else {
          prevInputs[i].value = 0
          diff -= value
        }
      }
    }
    // percents.forEach((id, i) => document.getElementById(id).textContent = sliders[i].value);
    values.forEach((id, i) => (document.getElementById(id).textContent = sliders[i].value))
    if (prevInputs[prevInputs.length - 1] !== ev.target) {
      prevInputs.push(ev.target)
    }
    while (prevInputs.length > sliders.length) {
      prevInputs.shift()
    }
    mySys.budget.feature = parseInt(sliders[0].value) * mySys.budget.available / 100
    mySys.budget.bugfix = parseInt(sliders[1].value) * mySys.budget.available / 100
    mySys.budget.refactor = parseInt(sliders[2].value) * mySys.budget.available / 100
  }

  updateDisplays () {
    valueDisp.innerHTML = this.stats.value
    featuresDisp.innerHTML = this.stats.features
    bugsDisp.innerHTML = this.stats.bugs
    healthDisp.innerHTML = this.stats.health
    budgetDisp.innerHTML = this.budget.available
  }
}


