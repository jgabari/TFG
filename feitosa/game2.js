/**
 * Class SimSys simulates the impacts of technical debt accumulation
 * over time in a software system.
 */
class SimSys {
    // Operational ranges of the system.
    MAX_HEALTH = 1;
    MIN_HEALTH = 0;
    MIN_BUGS = 0;

    /**
     * Constructor with default values.
     */
    constructor() {
        // Default configuration for the simulation.
        this.config = {
            init: {
                budget: 10,
                features: 10,
                bugs: 0,
                health: 1,
            },
            factors: {
                l: 0.1, // Lehman's Law: inherent degradation
                re: 0.1, // Refactoring effectiveness
                fae: 0.1, // Feature addition effectiveness
                bfe: 0.1, // Bug-fix effectiveness
                nbp: 0.1, // New bug proneness
                vf: 0.1, // Value generated per feature
                vb: 0.1, // Value lost per bug
                bm: 0.1, // Budget multiplier
            },
        };
        this.resetSimulation();
    }

    /**
     * Deserialize a saved simulation state from a browser cookie.
     * @param {string} serialized Serialized simulation state.
     * @returns {SimSys} A new instance of SimSys populated with the deserialized data.
     */
    static fromCookie(serialized) {
        const sim = new SimSys();
        const data = JSON.parse(serialized);
        sim.iteration = data.iteration;
        sim.config = data.config;
        sim.stats = data.stats;
        sim.budget = data.budget;
        return sim;
    }

    resetSimulation() {
        // Current iteration of the simulation
        this.iteration = 0;
        // Current stats for the simulation.
        this.stats = {
            features: this.config.init.features,
            bugs: this.config.init.bugs,
            health: this.config.init.health,
            value:
                this.config.init.features * this.config.factors.vf -
                this.config.init.bugs * this.config.factors.vb,
        };
        // Budget allocation for the current iteration.
        this.budget = {
            available: this.config.init.budget,
            feature: 0,
            bugfix: 0,
            refactor: 0,
        };
    }

    /**
     * Executes a single iteration of the simulation.
     * @param {number} round Precision for rounding numbers.
     * @throws {Error} When the budget allocation is invalid or system health drops to zero.
     */
    runIteration(round) {
        const f = this.config.factors; // Factors
        const b = this.budget; // Current budget
        const s = this.stats; // Current stats

        console.log(b.available);
        console.log(typeof b.available);
        console.log(b.feature);
        console.log(b.bugfix);
        console.log(b.refactor);
        if (b.available !== b.feature + b.bugfix + b.refactor) {
            throw new Error("Budget is not valid.");
        }

        this.iteration++;

        // Update health status
        s.health = s.health + b.refactor * f.re - f.l;
        s.health = Math.min(this.MAX_HEALTH, s.health);
        s.health = Math.max(this.MIN_HEALTH, s.health);
        s.health = this.round(s.health, round);

        if (s.health === 0) {
            throw new Error("Your system became unmaintainable and collapsed.");
        }

        // Update features status
        s.features = s.features + b.feature * s.health * f.fae;
        s.features = this.round(s.features, round);

        // Update bug status
        const fixedbugs = b.bugfix * s.health * f.bfe;
        const newbugs = (b.feature / s.health) * f.nbp;
        s.bugs = s.bugs - fixedbugs + newbugs;
        s.bugs = Math.max(this.MIN_BUGS, s.bugs);
        s.bugs = this.round(s.bugs, round);

        // Calculate system value
        const featuremerit = s.features * f.vf;
        const bugthreat = s.bugs * f.vb;
        s.value = featuremerit - bugthreat;
        s.value = this.round(s.value, round);

        // Calculate available budget for the next iteration
        b.available = s.value * f.bm;
        b.available = this.round(b.available, round);
    }

    /**
     * Round a number to a given precision.
     * @param {number} number Number to be rounded.
     * @param {number} precision Number of decimal places.
     * @returns {number} Rounded number.
     */
    round(number, precision) {
        const factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    }

    /**
     * Serialize the current simulation state for saving as a browser cookie.
     * @returns {string} Serialized simulation state.
     */
    toString() {
        return JSON.stringify({
            iteration: this.iteration,
            stats: this.stats,
            budget: this.budget,
            config: this.config,
        });
    }
}

// Get elements from HTML
const iterate_btn = document.getElementById("iterate_btn");
const reset_btn = document.getElementById("reset_btn");
const download_btn = document.getElementById("download_btn");
const upload_btn = document.getElementById("upload_btn");
const features_input = document.getElementById("features_input");
const bugs_input = document.getElementById("bugs_input");
const health_input = document.getElementById("health_input");
const value_display = document.getElementById("value_display");
const features_display = document.getElementById("features_display");
const bugs_display = document.getElementById("bugs_display");

// Initial situation
let mySys = new SimSys();

// Check the cookie
if (document.cookie.indexOf("state") !== -1) {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const parts = cookie.split("=");
        if (parts[0] === "state") {
            mySys.fromCookie(parts[1]);
        }
    }
}

// Allocate the budget in the three different inputs
features_input.addEventListener('input', updateSum("features_input"));
bugs_input.addEventListener('input', updateSum("bugs_input"));
health_input.addEventListener('input', updateSum("health_input"));

let prevInput = "";

function updateSum(input) {
    let total = features_input.value + bugs_input.value + health_input.value;
    if (total > 10) {
        document.getElementById(prevInput).value -= 1;
    }
    prevInput = input;
}


iterate_btn.addEventListener("click", function() {
    mySys.runIteration(2);
    document.cookie = mySys.toString();
})

reset_btn.addEventListener("click", function() {
    mySys.resetSimulation();
    document.cookie = mySys.toString();
})

download_btn.addEventListener("click", function() {
    fs.writeFileSync("state.json", mySys.toString());
    fetch('/download', {
        method: "POST",
        body: mySys.toString(),
        headers: {"Content-Type": "application/json"}
    })
})

upload_btn.addEventListener("click", function() {
    const state = fs.readFileSync("state.json");
    const stateJSON = JSON.parse(state);
    mySys.iteration = stateJSON.iteration;
    mySys.config = stateJSON.config;
    mySys.stats = stateJSON.stats;
    mySys.budget = stateJSON.budget;
})