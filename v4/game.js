/**
 * Class SimSys v4
 * Combines v2 math with v4 CSS-Grid visuals.
 */
class SimSys {
    // Operational ranges of the system.
    MAX_HEALTH = 100
    MIN_HEALTH = 0
    MIN_BUGS = 0

    constructor() {
        // DOM Elements
        this.grid = document.getElementById('project-grid');
        this.elements = {
            value: document.getElementById('value_display'),
            features: document.getElementById('features_display'),
            bugs: document.getElementById('bugs_display'),
            health: document.getElementById('health_display'),
            budget: document.getElementById('budget_display'),
            sliders: {
                features: document.getElementById('features_input'),
                bugs: document.getElementById('bugs_input'),
                refactor: document.getElementById('refactor_input')
            },
            outputs: {
                features: document.getElementById('features_value'),
                bugs: document.getElementById('bugs_value'),
                refactor: document.getElementById('refactor_value')
            }
        };

        // Configuration
        this.config = {
            init: {
                budget: 100,
                features: 0,
                bugs: 0,
                health: 100
            },
            factors: {
                l: 1, // Lehman's Law: inherent degradation
                re: 1, // Refactoring effectiveness
                fae: 1, // Feature addition effectiveness
                bfe: 1, // Bug-fix effectiveness
                nbp: 1, // New bug proneness
                vf: 1, // Value generated per feature
                vb: 1, // Value lost per bug
                bm: 1 // Budget multiplier
            }
        }

        this.resetSimulation()
        this.bindEvents();
    }

    bindEvents() {
        // Slider Logic
        const sliders = [
            this.elements.sliders.features,
            this.elements.sliders.bugs,
            this.elements.sliders.refactor
        ];

        // Store previous values to handle the "sum must be <= 100" logic
        this.prevInputs = [];

        sliders.forEach(input => {
            input.addEventListener('input', (ev) => this.handleSliderChange(ev, sliders));
        });

        // Buttons
        document.getElementById('iterate_btn').addEventListener('click', () => this.runIteration(2));
        document.getElementById('reset_btn').addEventListener('click', () => this.resetSimulation());
    }

    resetSimulation() {
        this.iteration = 0
        this.stats = {
            features: this.config.init.features,
            bugs: this.config.init.bugs,
            health: this.config.init.health,
            value: 0
        }
        this.budget = {
            available: this.config.init.budget,
            feature: 0,
            bugfix: 0,
            refactor: 0
        }

        // Reset Sliders
        Object.values(this.elements.sliders).forEach(s => s.value = 0);
        Object.values(this.elements.outputs).forEach(o => o.textContent = '0');

        this.updateDisplays();
    }

    runIteration(round) {
        const f = this.config.factors
        const b = this.budget
        const s = this.stats

        // Calculate budget allocation from sliders
        // The sliders represent percentage of available budget
        b.feature = parseInt(this.elements.sliders.features.value) * b.available / 100;
        b.bugfix = parseInt(this.elements.sliders.bugs.value) * b.available / 100;
        b.refactor = parseInt(this.elements.sliders.refactor.value) * b.available / 100;

        this.iteration++

        // 1. Update Health
        // Health degrades by Lehman's law (l) and improves by refactoring (re)
        s.health = s.health + b.refactor * f.re - f.l
        s.health = Math.min(this.MAX_HEALTH, Math.max(this.MIN_HEALTH, s.health))
        s.health = this.round(s.health, round)

        if (s.health <= 0) {
            alert('SYSTEM COLLAPSE: Your technical debt became unmanageable.');
            return;
        }

        // 2. Update Features
        // Features grow based on budget allocated * current health (productivity)
        const newFeatures = b.feature * (s.health / 100) * f.fae;
        s.features += newFeatures;
        s.features = this.round(s.features, round)

        // 3. Update Bugs
        // Bugs are fixed by bugfix budget * health
        // New bugs are introduced by feature development (inversely proportional to health)
        const fixedbugs = b.bugfix * (s.health / 100) * f.bfe
        const newbugs = (b.feature / (s.health || 1)) * f.nbp // Avoid div by zero
        s.bugs = s.bugs - fixedbugs + newbugs
        s.bugs = Math.max(this.MIN_BUGS, this.round(s.bugs, round))

        // 4. Calculate Value
        s.value = this.round((s.features * f.vf) - (s.bugs * f.vb), round);

        // 5. Next Iteration Budget
        b.available = this.round(Math.max(10, s.value * f.bm), round); // Min budget 10 to keep game alive

        this.updateDisplays()
    }

    updateDisplays() {
        // Update Text Stats
        this.elements.value.textContent = this.stats.value;
        this.elements.features.textContent = Math.floor(this.stats.features);
        this.elements.bugs.textContent = Math.floor(this.stats.bugs);
        this.elements.health.textContent = this.stats.health + '%';
        this.elements.budget.textContent = this.budget.available;

        // Update Visual Grid
        this.renderGrid();
    }

    renderGrid() {
        // 1. Update Global Health Visuals (via CSS Variable)
        // Map health 0-100 to 0.0-1.0
        const healthFactor = this.stats.health / 100;
        // We update the style on the CONTAINER, so all children inherit it via var(--system-health)
        this.grid.style.setProperty('--system-health', healthFactor);

        // 2. Sync Number of Modules
        const targetCount = Math.floor(this.stats.features);
        const currentCount = this.grid.childElementCount;

        if (targetCount > currentCount) {
            // Add new modules
            const diff = targetCount - currentCount;
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < diff; i++) {
                const div = document.createElement('div');
                div.className = 'module';
                fragment.appendChild(div);
            }
            this.grid.appendChild(fragment);
        } else if (targetCount < currentCount) {
            // Remove modules (rare in this game unless features are removed, but safety first)
            const diff = currentCount - targetCount;
            for (let i = 0; i < diff; i++) {
                if (this.grid.lastChild) {
                    this.grid.removeChild(this.grid.lastChild);
                }
            }
        }
    }

    handleSliderChange(ev, sliders) {
        // Logic to ensure total slider % doesn't exceed 100
        const total = sliders.reduce((sum, slider) => sum + parseInt(slider.value), 0);

        if (total > 100) {
            let diff = total - 100;
            // Subtract from previous inputs to maintain 100% cap
            // This is a simplified version of the logic in v2
            for (let i = this.prevInputs.length - 1; i >= 0 && diff > 0; i--) {
                const input = this.prevInputs[i];
                if (input === ev.target) continue; // Don't change the one currently being dragged

                const val = parseInt(input.value);
                if (val >= diff) {
                    input.value = val - diff;
                    diff = 0;
                } else {
                    input.value = 0;
                    diff -= val;
                }
            }
        }

        // Update display numbers next to sliders
        sliders.forEach((s, i) => {
            const id = s.id.replace('input', 'value');
            document.getElementById(id).textContent = s.value;
        });

        // Track touch order for the simple subtraction logic
        if (this.prevInputs[this.prevInputs.length - 1] !== ev.target) {
            this.prevInputs = this.prevInputs.filter(i => i !== ev.target); // Remove if exists
            this.prevInputs.push(ev.target);
        }
    }

    round(number, precision) {
        const factor = Math.pow(10, precision)
        return Math.round(number * factor) / factor
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.game = new SimSys();
});
