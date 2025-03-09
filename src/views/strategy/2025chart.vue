<template>
    <div class="strategy-chart-container">
        <h1 class="page-title">Strategy Charts</h1>

        <div class="ui-container">
            <details open @toggle="inputToggled" class="ui-details">
                <summary class="ui-summary">
                    <span class="summary-text">UI Controls</span>
                    <span class="summary-icon">{{ isUiOpen ? '▼' : '▶' }}</span>
                </summary>
                <div id="ui" class="ui-controls"></div>
                <button id="recalculate" @click="calculate" class="calculate-button" :disabled="loading">
                    <span v-if="!loading" class="button-text">Calculate</span>
                    <span v-else class="button-text">Calculating...</span>
                </button>
            </details>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">{{ loadingMessage }}</p>
        </div>

        <div id="split-view-container" class="split-view-container" :class="{ 'hidden': loading }">
            <!-- Left panel -->
            <div class="split-view">
                <h3 class="section-title">Strategy Comparison</h3>
                <details class="key-details">
                    <summary class="key-summary">Key:</summary>
                    <ul class="key-list">
                        <li><span class="key-mark" style="background-color:#00cc00;"></span>3 RNKPNT</li>
                        <li><span class="key-mark" style="background-color:#ffcc00;"></span>2 RNKPNT</li>
                        <li><span class="key-mark" style="background-color:#ff9b00;"></span>1 RNKPNT</li>
                        <li><span class="key-mark" style="background-color:#ff3333;"></span>0 RNKPNT</li>
                    </ul>
                </details>
                <div class="scroller" :class="{ 'scrollerOpen': isUiOpen }">
                    <div class="chart-container">
                        <canvas id="psChart" class="chart" @click="handleChartClick"></canvas>
                        <canvas id="piecesScoredchart" class="chart" @click="handleChartClick"></canvas>
                        <p class="chart-note">Note that the color indicator for this graph is inaccurate b/c the points
                            overlap.</p>
                        <canvas id="scenarioChart" class="chart" @click="handleChartClick"></canvas>
                        <p id="shiftkey"></p>
                        <canvas id="rnkpntChart" class="chart" @click="handleChartClick"></canvas>
                    </div>
                </div>
            </div>

            <div id="split-view-divider" class="split-view-divider"></div>

            <!-- Right panel -->
            <div class="split-view">
                <h3 id="selectedScenario" class="section-title">Selected Scenario</h3>
                <div class="scroller" :class="{ 'scrollerOpen': isUiOpen }">
                    <p id="tooltip" class="tooltip-container"></p>
                    <div class="chart-container">
                        <details class="key-details">
                            <summary class="key-summary">Key:</summary>
                            <ul class="key-list">
                                <li><span class="key-mark" style="background-color:#000000;"></span>L4</li>
                                <li><span class="key-mark" style="background-color:#969696;"></span>L3</li>
                                <li><span class="key-mark" style="background-color:#c8c8c8;"></span>L2</li>
                                <li><span class="key-mark"
                                        style="background-color:#ffffff; border: 1px solid black"></span>L1</li>
                            </ul>
                        </details>
                        <canvas id="psotchart" class="chart"></canvas>
                        <canvas id="myChart" class="chart"></canvas>
                        <h3 class="section-title">Coral Scored by Level</h3>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th class="text-center">Scoring Level</th>
                                        <th class="text-center"># Scored</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="ta-c text-center">L4</td>
                                        <td id="L4_Scored" class="text-center"></td>
                                    </tr>
                                    <tr>
                                        <td class="ta-c text-center">L3</td>
                                        <td id="L3_Scored" class="text-center"></td>
                                    </tr>
                                    <tr>
                                        <td class="ta-c text-center">L2</td>
                                        <td id="L2_Scored" class="text-center"></td>
                                    </tr>
                                    <tr id="L1">
                                        <td class="ta-c text-center">L1</td>
                                        <td id="L1_Scored" class="text-center"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <h3 class="section-title">Play by Play</h3>
                        <div class="table-responsive">
                            <table id="table_id" class="data-table play-by-play w-full">
                                <thead>
                                    <tr>
                                        <th class="text-center">Event</th>
                                        <th class="text-center">Time Left</th>
                                        <th class="text-center">Elapsed Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Rows will be added dynamically -->
                                    <!-- <tr>
                                        <td class="text-center">Sample Event</td>
                                        <td class="text-center">10:00</td>
                                        <td class="text-center">5:00</td>
                                    </tr> -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
    name: 'StrategyChart',
    data() {
        return {
            // UI state
            isUiOpen: true,
            loading: true,
            loadingMessage: "Initializing...",

            // Chart initialization state
            chartsInitialized: false,
            chartInitQueue: [],
            retryCount: 0,
            maxRetries: 3,
            dataInitialized: false,
            currentChartIndex: 0,
            chartLoadDelay: 1000, // Reduced to 1 second

            // Chart instances map
            charts: new Map(),

            // Constants
            doLinksExist: false,
            linkProgression: [2, 2, 2, 2, 2, 2, 2, 2],
            linkPoints: [0, 0],
            pointsForBalancing: [0, 12],
            pointsForBestScorer: [7, 5], // lvl 4
            pointsForMidScorer: [6, 4], // lvl 3
            pointsForOkScorer: [4, 3], // lvl 2
            pointsForWorstScorer: [3, 2], // lvl 1
            pointsForTrap: [0, 0],
            pointsForMobility: 3,
            autonPieceLimit: 5,
            holdPieceLimit: 1,
            piecesScoredForRnkPnt: [20, 0],

            // Iterating arrays
            autonMovementName: 'Auton Movement (s) ["=Teleop" sets this to equal teleop movement]',
            iteratingArrays: [
                ["Balance/Climb/Hang (s)", 5, 6],
                ["Output (s)", 1.5, 2, 2.5],
                ["Intake (s)", .75, 1, 1.25],
                ['Auton Movement (s) ["=Teleop" sets this to equal teleop movement]', "=Teleop"],
                ["Teleop Movement (s)", 5, 6, 7],
                ["Alliance robots leave auton (Boolean)", 0, 1],
                ["At least one alliance robot parks (Boolean)", 0, 1],
                ["Algae dislodge (s)", 1],
                ["Grab Amount (on average)", 1],
            ],
            iteratingArraysVisibleInputOffset: 1,

            // Charts data
            allPointsVsTime: [],
            allPieceCountVsTime: [],
            rnkValueVsScenario: [],
            pieceCountVsScenario: [],
            totalScoreVsScenario: [],
            pieceCountVsTotalScore: [],
            specificPointsVsTime: [],
            specificPieceCountVsTime: [],
            allColorOverTime: [],
            specificColorOverTime: [],
            color: [],
            scenarioAction: [],
            scenarioTimes: [],
            pointsClicked: [],
            zeroIndicesPointsClicked: [],
            scenario: { points: 0, time: 150, z: 0 },
            piecesScored: [],
            holdingPiece: [],
            links: [],
            numberOfScenarios: 1,
            endpoints: [-1],
            endpointsofspecificPieceCountVsTime: [-1],
            groupsofpoints: [],
            coordinatesofgroups: [],
            zeroindices: [],
            maxs: [],
            mins: [],
            maxDecimals: 0,

            // Chart instances
            scenariochart: null,
            rnkpntchart: null,
            pschart: null,
            piecesschart: null,
            psotchart: null,
            scoretimechart: null
        };
    },
    mounted() {
        // Use setTimeout to ensure DOM is ready
        this.loadingMessage = "Preparing data...";
        setTimeout(() => {
            this.initializeData();
        }, 1000);

        // Add window resize event listener
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        // Clean up event listener
        window.removeEventListener('resize', this.handleResize);

        // Destroy chart instances
        this.destroyCharts();
    },
    methods: {
        // Utility methods
        l(...args) {
            console.log(...args);
        },

        handleResize() {
            if (this.dataInitialized) {
                this.$nextTick(() => {
                    this.updateCharts();
                });
            }
        },

        // Modified destroy charts method
        destroyCharts() {
            // Destroy all chart instances
            for (const chart of this.charts.values()) {
                chart.destroy();
            }
            this.charts.clear();
        },

        inputToggled(event) {
            this.isUiOpen = event.target.open;
            const scroller1 = document.getElementsByClassName('scroller')[0];
            const scroller2 = document.getElementsByClassName('scroller')[1];
            if (scroller1 && scroller2) {
                if (scroller1.classList.contains('scrollerOpen')) {
                    scroller1.classList.remove('scrollerOpen');
                    scroller2.classList.remove('scrollerOpen');
                } else {
                    scroller1.classList.add('scrollerOpen');
                    scroller2.classList.add('scrollerOpen');
                }
            }
        },

        // Data initialization
        initializeData() {
            try {
                this.loading = true;
                this.loadingMessage = "Preparing data...";
                this.chartsInitialized = false;

                // Destroy existing charts first
                this.destroyCharts();

                // Initialize from sessionStorage if available
                if (sessionStorage.getItem('iteratingArrays')) {
                    try {
                        this.iteratingArrays = JSON.parse(sessionStorage.getItem('iteratingArrays'));
                    } catch (e) {
                        console.error("Error parsing iteratingArrays from sessionStorage:", e);
                    }
                }

                // Calculate maxDecimals
                const numbersToCheck = this.iteratingArrays.flat(1).filter(i => typeof i !== 'string' && !isNaN(i));
                this.maxDecimals = numbersToCheck.reduce((max, num) => {
                    const decimalPart = num.toString().split('.')[1];
                    return Math.max(max, decimalPart ? decimalPart.length : 0);
                }, 0);

                // Initialize UI
                this.initializeUI();

                // Reset number of scenarios
                this.numberOfScenarios = 1;

                // Calculate number of scenarios
                for (let i of this.iteratingArrays) {
                    this.numberOfScenarios *= i.length - 1;
                }

                // Clear previous data
                this.clearChartData();

                // Generate all scenarios data in chunks to avoid blocking the UI
                this.loadingMessage = "Generating scenarios data...";
                setTimeout(() => {
                    this.generateScenariosDataInChunks(0, Math.min(50, this.numberOfScenarios));
                }, 500);
            } catch (error) {
                console.error("Error initializing data:", error);
                this.loading = false;
                this.loadingMessage = "Error initializing data. Please try again.";
            }
        },

        clearChartData() {
            // Clear all data arrays
            this.allPointsVsTime = [];
            this.allPieceCountVsTime = [];
            this.rnkValueVsScenario = [];
            this.pieceCountVsScenario = [];
            this.totalScoreVsScenario = [];
            this.pieceCountVsTotalScore = [];
            this.specificPointsVsTime = [];
            this.specificPieceCountVsTime = [];
            this.allColorOverTime = [];
            this.specificColorOverTime = [];
            this.color = [];
            this.scenarioAction = [];
            this.scenarioTimes = [];
            this.pointsClicked = [];
            this.zeroIndicesPointsClicked = [];
            this.piecesScored = [];
            this.holdingPiece = [];
            this.links = [];
            this.endpoints = [-1];
            this.endpointsofspecificPieceCountVsTime = [-1];
            this.groupsofpoints = [];
            this.coordinatesofgroups = [];
            this.zeroindices = [];
            this.maxs = [];
            this.mins = [];
        },

        initializeUI() {
            const ui = document.getElementById("ui");
            if (!ui) return;

            ui.innerHTML = '';
            for (let i = 0; i < this.iteratingArrays.length; ++i) {
                if (i >= this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset) {
                    ui.innerHTML += `<div style='display:none'>
                    ${this.iteratingArrays[i][0]}: 
                    <input id="ui${i}" value="${this.iteratingArrays[i].slice(1)}" >
                    </div>`;
                } else {
                    ui.innerHTML += `<div class="input-group">
                    <label for="ui${i}">${this.iteratingArrays[i][0]}:</label>
                    <input id="ui${i}" value="${this.iteratingArrays[i].slice(1)}" class="ui-input">
                    </div>`;
                }
            }
        },

        // Generate scenarios data in chunks to avoid blocking the UI
        generateScenariosDataInChunks(startIndex, endIndex) {
            try {
                const chunkSize = 50; // Process 50 scenarios at a time
                const currentEnd = Math.min(endIndex, this.numberOfScenarios);

                // Update loading message with progress
                const progress = Math.round((currentEnd / this.numberOfScenarios) * 100);
                this.loadingMessage = `Generating scenarios data... ${progress}%`;

                // Process current chunk
                for (let i = startIndex; i < currentEnd; ++i) {
                    this.generateSingleScenarioData(i);
                }

                // If there are more scenarios to process, schedule the next chunk
                if (currentEnd < this.numberOfScenarios) {
                    setTimeout(() => {
                        this.generateScenariosDataInChunks(currentEnd, currentEnd + chunkSize);
                    }, 0); // Use setTimeout with 0 delay to allow UI updates between chunks
                } else {
                    // All scenarios processed, continue with the rest of initialization
                    this.loadingMessage = "Calculating endpoints...";
                    setTimeout(() => {
                        this.calculateEndpoints();

                        this.loadingMessage = "Creating groups of points...";
                        setTimeout(() => {
                            this.createGroupsOfPoints();

                            this.loadingMessage = "Updating data...";
                            setTimeout(() => {
                                this.updatedata(0);

                                this.loadingMessage = "Initializing charts...";
                                setTimeout(() => {
                                    this.initializeChartsStaggered();
                                }, 500);
                            }, 500);
                        }, 500);
                    }, 500);
                }
            } catch (error) {
                console.error("Error generating scenarios data in chunks:", error);
                this.loading = false;
                this.loadingMessage = "Error generating data. Please try again.";
            }
        },

        // Generate data for a single scenario
        generateSingleScenarioData(i) {
            const scenarioDecoded = this.decodeScenario(i);
            for (let j in this.iteratingArrays) {
                this.scenario[this.iteratingArrays[j][0]] = this.iteratingArrays[j][Number(scenarioDecoded.charAt(j)) + 1];
            }

            // This can be optimized if put outside of scenario tree loop in calculate
            for (let k of this.iteratingArrays) {
                if (k[0] == this.autonMovementName && k[1] == "=Teleop") {
                    this.scenario[this.autonMovementName] = this.scenario["Teleop Movement (s)"];
                    break;
                }
            }

            // Initialize the variables
            this.piecesScored[0] = 0;
            this.holdingPiece[0] = 1; // Start w/ holding one piece
            this.scenario.time = 150; // Seconds left in the game
            this.scenario.points = this.pointsForMobility; // Will always get
            this.piecesScored[0] = 0;
            const trueBalancingTime = this.scenario["Balance/Climb/Hang (s)"] * (this.pointsForBalancing[0] > 0);

            // Auton
            // If there's time to balance and score
            if (this.scenario.time - this.scenario[this.autonMovementName] / 2 - trueBalancingTime >= 135) {
                this.scenario.time -= this.scenario[this.autonMovementName] / 2;
                // Place pieces during auton
                while (this.scenario.time - this.scenario["Output (s)"] - trueBalancingTime >= 135 && this.piecesScored[0] < this.autonPieceLimit) {
                    this.autonScorePiece(i);
                    if (this.scenario.time - this.scenario[this.autonMovementName] / 2 - this.scenario["Intake (s)"] >= 135) { // autonMovement is cut in half b/c the bot only travels to pick up game pices, not also back 
                        this.scenario.time -= this.scenario[this.autonMovementName] / 2 + this.scenario["Intake (s)"];
                        this.holdingPiece[0] += this.scenario["Grab Amount (on average)"];
                        if (this.piecesScored[0] + this.holdingPiece[0] > this.autonPieceLimit) {
                            // Need to reduce the time to grab since grabbing less than the grabAmount
                            this.holdingPiece[0] = this.autonPieceLimit - this.piecesScored[0];
                        } // Prevents holding more pieces than allowed given the autonPieceLimit and the pieces already scored: this is needed in a game where you can pick up more than one piece at a time
                        if (this.scenario.time - this.scenario[this.autonMovementName] / 2 - this.scenario["Output (s)"] - trueBalancingTime >= 135) {
                            this.scenario.time -= this.scenario[this.autonMovementName] / 2;
                        } else if (this.pointsForBalancing[0] > 0) { // Balance if auton-balance is allowed
                            this.scenario.time = 135 + trueBalancingTime;
                            this.scenario.points += this.pointsForBalancing[0];
                            this.scenario.time -= this.scenario["Balance/Climb/Hang (s)"];
                            this.addPlotData(i, "Balance/Climb/Hang");
                        } else {
                            this.scenario.time = 135;
                        }
                    }
                }
            } else if (this.scenario.time - trueBalancingTime >= 135) { // Balance if auton-balance is allowed
                this.scenario.points += this.pointsForBalancing[0];
                this.scenario.time -= this.scenario["Balance/Climb/Hang (s)"];
                this.addPlotData(i, "Balance/Climb/Hang");
            }

            // Teleop
            this.scenario.time = 135;

            // If holding pieces at beginning of teleop
            if (this.holdingPiece[0] > 0) {
                this.piecesScored[0] += this.holdingPiece[0];
                this.holdingPiece[0] = 0;
                this.scenario.time -= this.scenario["Output (s)"];
                this.scenario.points += this.pointsForBestScorer[1];

                this.allColorOverTime.push('rgb(0,0,0)');

                let linkscored = false;
                if (this.doLinksExist) {
                    let sum = 0;

                    for (let j of this.linkProgression) {
                        sum += j;
                        if (this.piecesScored[0] - sum == 0) {
                            this.scenario.points += this.linkPoints[1];
                            linkscored = true;
                        }
                    }
                }

                if (linkscored) {
                    this.addPlotData(i, "scored speaker & link");
                } else {
                    this.addPlotData(i, "scored coral into Lvl4");
                }
            }

            while (
                this.scenario.time - this.scenario["Teleop Movement (s)"] - this.scenario["Output (s)"] - this.scenario["Intake (s)"] - this.scenario["Balance/Climb/Hang (s)"] * (this.pointsForBalancing[1] > 0)
                - this.scenario['Algae dislodge (s)'] * (this.piecesScored[0] == 5 || this.piecesScored[0] == 7 || this.piecesScored[0] == 9)
                >= 0
            ) {
                this.holdingPiece[0] += this.scenario["Grab Amount (on average)"];
                this.scorePiece(i);
                if (this.piecesScored[0] == 42) { // Assuming 24 on level one, 12 on level four, and 6 on level two
                    break;
                }
            }

            // Endgame
            this.scenario.points += this.pointsForBalancing[1];
            this.scenario.time -= this.scenario["Balance/Climb/Hang (s)"];
            this.addPlotData(i, "Balance/Climb/Hang");

            // Push chart-values that have scenarios as a dimension
            let rankpoint = this.piecesScored[0] >= this.piecesScoredForRnkPnt[0] ? 1 : 0;
            if (this.scenario["Alliance robots leave auton (Boolean)"]) ++rankpoint;
            if (this.scenario["At least one alliance robot parks (Boolean)"]) ++rankpoint;

            if (rankpoint == 3) {
                this.rnkValueVsScenario.push({ x: i, y: 3 });
                this.color.push("rgb(0,255,0)");
            } else if (rankpoint == 2) {
                this.rnkValueVsScenario.push({ x: i, y: 2 });
                this.color.push("rgb(255,255,0)");
            } else if (rankpoint == 1) {
                this.rnkValueVsScenario.push({ x: i, y: 1 });
                this.color.push("rgb(255,155,0)");
            } else {
                this.rnkValueVsScenario.push({ x: i, y: 0 });
                this.color.push("rgb(255,0,0)");
            }

            this.totalScoreVsScenario.push({ x: i, y: this.scenario.points });
            this.pieceCountVsScenario.push({ x: i, y: this.piecesScored[0] });
            this.pieceCountVsTotalScore.push({ x: this.scenario.points, y: this.piecesScored[0], scenario: i });
        },

        // Calculate button handler
        calculate() {
            try {
                // Disable the calculate button while processing
                const calculateButton = document.getElementById("recalculate");
                if (calculateButton) {
                    calculateButton.disabled = true;
                }

                // Show loading state
                this.loading = true;
                this.loadingMessage = "Preparing calculation...";
                this.chartsInitialized = false;

                // Destroy existing charts to free up resources
                this.destroyCharts();

                for (let i in this.iteratingArrays) {
                    let arr;
                    const inputElement = document.getElementById("ui" + i);

                    if (!inputElement) continue;

                    if (this.iteratingArrays[i][0] === this.autonMovementName && inputElement.value === "=Teleop") {
                        this.iteratingArrays[i] = [this.autonMovementName, "=Teleop"];
                    } else {
                        arr = [this.iteratingArrays[i][0]];
                        // Validate and clean input values
                        const inputValues = inputElement.value.split(',')
                            .map(val => val.trim())
                            .filter(val => val !== '')
                            .map(val => {
                                const num = Number(val);
                                return isNaN(num) ? val : num;
                            });

                        arr.push(...inputValues);
                        this.iteratingArrays[i] = arr;
                    }
                }

                // Save to session storage
                sessionStorage.setItem('iteratingArrays', JSON.stringify(this.iteratingArrays));

                // Use setTimeout to give the UI time to update
                setTimeout(() => {
                    // Reinitialize data
                    this.initializeData();
                }, 500);
            } catch (error) {
                console.error("Error in calculate method:", error);
                // Re-enable the calculate button on error
                const calculateButton = document.getElementById("recalculate");
                if (calculateButton) {
                    calculateButton.disabled = false;
                }
                this.loading = false;
                this.loadingMessage = "Error during calculation. Please try again.";
            }
        },

        // Scenario encoding/decoding
        encodeScenario(a) {
            let result = 0;
            let multiplier = 1;
            for (let i = a.length - 1; i >= 0; --i) {
                result += a.charAt(i) * multiplier;
                multiplier *= this.iteratingArrays[i].length - 1;
            }
            return result;
        },

        decodeScenario(a) {
            let divisor = this.numberOfScenarios / (this.iteratingArrays[0].length - 1);
            let result = "";
            let remainder = a;
            for (let i in this.iteratingArrays) {
                result += Math.floor(remainder / divisor);
                remainder -= Math.floor(remainder / divisor) * divisor;
                if (this.iteratingArrays[Number(i) + 1]) divisor /= this.iteratingArrays[Number(i) + 1].length - 1;
            }
            return result;
        },

        // Update data for a specific scenario
        updatedata(scenario) {
            try {
                const selectedScenarioElement = document.getElementById("selectedScenario");
                if (!selectedScenarioElement) return;

                const visibleDecodeScenario = this.decodeScenario(scenario).substring(0, this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset);

                const scenarioStringified = this.iteratingArrays.slice(0, this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset)
                    .map(([key, ...values], index) => {
                        const decodedIndex = Number(visibleDecodeScenario.charAt(index));
                        const value = values[decodedIndex] ?? (values[0] === "=Teleop" ? "=Teleop" : values[0]);
                        return `${key}: ${value}`;
                    }).join('<br>');

                selectedScenarioElement.innerHTML = `
                    <details open class='scenario-details'>
                    <summary class='scenario-summary'>Selected Scenario: ${scenario} - ${visibleDecodeScenario}</summary>
                    <p class='scenario-info'>${scenarioStringified}</p>
                    </details>
                `;

                for (let i in this.scenarioTimes) {
                    if (this.scenarioTimes[i] && this.scenarioTimes[i].includes("-")) {
                        console.error("Problem: a scenario takes longer than 2:30");
                        this.scenarioAction[i] -= 0;
                    }
                }

                let scenarioDecoded = scenario;
                if (typeof (scenario) === "string") {
                    scenarioDecoded = this.encodeScenario(scenario);
                }

                const startpoint = this.endpoints[scenarioDecoded] + 1;
                const endpoint = this.endpoints[scenarioDecoded + 1];
                const startpointofspecificPieceCountVsTime = this.endpointsofspecificPieceCountVsTime[scenarioDecoded] + 1;
                const endpointofspecificPieceCountVsTime = this.endpointsofspecificPieceCountVsTime[scenarioDecoded + 1];

                // Empty out the data arrays
                this.specificPointsVsTime = [];
                this.specificPieceCountVsTime = [];
                this.specificColorOverTime = [];

                // For each point in the given range, push a point to the specificPointsVsTime array
                if (startpoint <= endpoint) {
                    for (let i = startpoint; i < endpoint + 1; i++) {
                        if (this.allPointsVsTime[i]) {
                            this.specificPointsVsTime.push(this.allPointsVsTime[i]);
                        }
                    }
                }

                if (startpointofspecificPieceCountVsTime <= endpointofspecificPieceCountVsTime) {
                    for (let i = startpointofspecificPieceCountVsTime; i < endpointofspecificPieceCountVsTime + 1; i++) {
                        if (this.allPieceCountVsTime[i]) {
                            this.specificPieceCountVsTime.push(this.allPieceCountVsTime[i]);
                        }
                        if (this.allColorOverTime[i]) {
                            this.specificColorOverTime.push(this.allColorOverTime[i]);
                        }
                    }
                }

                let string_copy = "";
                let string_copy2 = "";

                if (this.scenarioAction[scenarioDecoded]) {
                    string_copy = this.scenarioAction[scenarioDecoded];
                }

                if (this.scenarioTimes[scenarioDecoded]) {
                    string_copy2 = this.scenarioTimes[scenarioDecoded];
                }

                let table = document.getElementById("table_id");
                if (table) {
                    // Clear existing rows
                    while (table.rows.length > 1) {
                        table.deleteRow(1);
                    }

                    // Add new rows
                    while (string_copy && string_copy.length > 0) {
                        let i = string_copy.indexOf(";");
                        let j = string_copy2.indexOf(";");

                        if (i === -1 || j === -1) break;

                        const tr = document.createElement("tr");
                        const td0 = document.createElement("td");
                        const td1 = document.createElement("td");
                        const td2 = document.createElement("td");

                        td0.innerText = string_copy.substring(0, i);
                        td1.innerText = Number(string_copy2.substring(0, j)).toFixed(this.maxDecimals);
                        td2.innerText = (150 - string_copy2.substring(0, j)).toFixed(this.maxDecimals);

                        string_copy = string_copy.substring(i + 1);
                        string_copy2 = string_copy2.substring(j + 1);

                        tr.appendChild(td0);
                        tr.appendChild(td1);
                        tr.appendChild(td2);
                        table.appendChild(tr);
                    }
                }

                // Count colors
                let totalL4 = this.specificColorOverTime.filter((a) => a == 'rgb(0,0,0)').length;
                let totalL3 = this.specificColorOverTime.filter((a) => a == 'rgb(150,150,150)').length;
                let totalL2 = this.specificColorOverTime.filter((a) => a == 'rgb(200,200,200)').length;
                let totalL1 = this.specificColorOverTime.filter((a) => a == 'rgb(255,255,255)').length;

                // Update level counts
                const l1Element = document.getElementById('L1_Scored');
                const l2Element = document.getElementById('L2_Scored');
                const l3Element = document.getElementById('L3_Scored');
                const l4Element = document.getElementById('L4_Scored');

                if (l1Element) l1Element.innerHTML = totalL1;
                if (l2Element) l2Element.innerHTML = totalL2;
                if (l3Element) l3Element.innerHTML = totalL3;
                if (l4Element) l4Element.innerHTML = totalL4;

                // Update charts if they exist
                if (this.chartsInitialized) {
                    // Use setTimeout to avoid potential recursion issues
                    setTimeout(() => {
                        this.updateCharts();
                    }, 0);
                }
            } catch (error) {
                console.error("Error updating data:", error);
            }
        },

        // Update chart data
        updateCharts() {
            try {
                if (!this.chartsInitialized) {
                    // If charts aren't initialized yet, don't try to update them
                    return;
                }

                // Update each chart individually with defensive checks
                if (this.pschart && this.totalScoreVsScenario?.length) {
                    this.charts.get("psChart").data.datasets[0].data = [...this.totalScoreVsScenario];
                    if (this.color?.length) {
                        this.charts.get("psChart").data.datasets[0].pointBackgroundColor = [...this.color];
                    }
                    this.charts.get("psChart").update('none');
                }

                if (this.piecesschart && this.pieceCountVsScenario?.length) {
                    this.charts.get("piecesScoredchart").data.datasets[0].data = [...this.pieceCountVsScenario];
                    if (this.color?.length) {
                        this.charts.get("piecesScoredchart").data.datasets[0].pointBackgroundColor = [...this.color];
                    }
                    this.charts.get("piecesScoredchart").update('none');
                }

                if (this.scenariochart && this.pieceCountVsTotalScore?.length) {
                    this.charts.get("scenarioChart").data.datasets[0].data = [...this.pieceCountVsTotalScore];
                    if (this.color?.length) {
                        this.charts.get("scenarioChart").data.datasets[0].pointBackgroundColor = [...this.color];
                    }
                    this.charts.get("scenarioChart").update('none');
                }

                if (this.rnkpntchart && this.rnkValueVsScenario?.length) {
                    this.charts.get("rnkpntChart").data.datasets[0].data = [...this.rnkValueVsScenario];
                    if (this.color?.length) {
                        this.charts.get("rnkpntChart").data.datasets[0].pointBackgroundColor = [...this.color];
                    }
                    this.charts.get("rnkpntChart").update('none');
                }

                if (this.psotchart && this.specificPieceCountVsTime?.length) {
                    this.charts.get("psotchart").data.datasets[0].data = [...this.specificPieceCountVsTime];
                    if (this.specificColorOverTime?.length) {
                        this.charts.get("psotchart").data.datasets[0].pointBackgroundColor = [...this.specificColorOverTime];
                        this.charts.get("psotchart").data.datasets[0].borderColor = this.specificColorOverTime.map(
                            color => color == "rgb(255,255,255)" ? "rgb(0,0,0)" : color
                        );
                    }
                    this.charts.get("psotchart").update('none');
                }

                if (this.scoretimechart && this.specificPointsVsTime?.length) {
                    this.charts.get("myChart").data.datasets[0].data = [...this.specificPointsVsTime];
                    this.charts.get("myChart").update('none');
                }
            } catch (error) {
                console.error("Error updating charts:", error);
            }
        },

        // Scoring methods
        autonScorePiece(scenarioEncoded) {
            this.piecesScored[0] += this.holdingPiece[0];
            this.scenario.time -= this.scenario["Output (s)"];
            this.scenario.points += this.pointsForBestScorer[0] * this.holdingPiece[0];
            this.holdingPiece[0] = 0;
            this.allColorOverTime.push('rgb(0,0,0)');

            this.addPlotData(scenarioEncoded, "score coral in Lvl4");
        },

        scorePiece(scenarioEncoded, alreadyHoldingAndPositioned) {
            if (this.piecesScored[0] == 5 || this.piecesScored[0] == 7 || this.piecesScored[0] == 9) {
                this.scenario.time -= this.scenario['Algae dislodge (s)'];
            }
            this.piecesScored[0] += this.holdingPiece[0];
            this.holdingPiece[0] = 0;

            this.scenario.time -= this.scenario["Teleop Movement (s)"] + this.scenario["Output (s)"] + this.scenario["Intake (s)"];
            if (alreadyHoldingAndPositioned) {
                this.scenario.time += this.scenario["Teleop Movement (s)"] + this.scenario["Intake (s)"];
            }

            let linkscored = false;
            if (this.doLinksExist) {
                let sum = 0;

                for (let i of this.linkProgression) {
                    sum += i;
                    if (this.piecesScored[0] - sum == 0) {
                        this.scenario.points += this.linkPoints[1];
                        linkscored = true;
                    }
                }
            }

            let pieceName = 'coral';
            let targetName;

            if (this.piecesScored[0] <= 5) {
                targetName = "Lvl4";
            } else if (this.piecesScored[0] <= 10) {
                targetName = "Lvl3";
            } else if (this.piecesScored[0] <= 15) {
                targetName = "Lvl2";
            } else if (this.piecesScored[0] <= 20) {
                targetName = "Lvl1";
            } else if (this.piecesScored[0] <= 27) {
                targetName = "Lvl4";
            } else {
                targetName = 'Lvl1';
            }

            if (targetName == "Lvl1") {
                this.scenario.points += this.pointsForWorstScorer[1];
                this.allColorOverTime.push('rgb(255,255,255)');
            } else if (targetName == "Lvl2") {
                this.scenario.points += this.pointsForOkScorer[1];
                this.allColorOverTime.push('rgb(200,200,200)');
            } else if (targetName == "Lvl3") {
                this.scenario.points += this.pointsForMidScorer[1];
                this.allColorOverTime.push('rgb(150,150,150)');
            } else if (targetName == "Lvl4") {
                this.scenario.points += this.pointsForBestScorer[1];
                this.allColorOverTime.push('rgb(0,0,0)');
            }

            if (linkscored) {
                this.addPlotData(scenarioEncoded, "scored piece & link");
            } else {
                this.addPlotData(scenarioEncoded, "scored " + pieceName + " into " + targetName);
            }
        },

        addPlotData(scenarioEncoded, action) {
            this.allPointsVsTime.push({ x: 150 - this.scenario.time, y: this.scenario.points });
            this.scenarioAction[scenarioEncoded] = (this.scenarioAction[scenarioEncoded] ?? "") + action + ";";
            this.scenarioTimes[scenarioEncoded] = (this.scenarioTimes[scenarioEncoded] ?? "") + this.scenario.time + ";";
            if (action.includes("score") || action.includes("collect")) {
                this.allPieceCountVsTime.push({ x: 150 - this.scenario.time, y: this.piecesScored[0] });
            }
        },

        calculateEndpoints() {
            // Figure out which scenario each set of scatter points belongs to by defining the endpoints of each scenario
            this.endpoints = [-1];
            for (let i = 0; i < this.allPointsVsTime.length - 1; ++i) {
                if (this.allPointsVsTime[i].x > this.allPointsVsTime[i + 1].x) {
                    this.endpoints.push(i);
                }
            }
            this.endpoints.push(this.allPointsVsTime.length - 1);

            // Do the same for the pieces scored-time chart
            this.endpointsofspecificPieceCountVsTime = [-1];
            for (let i = 0; i < this.allPieceCountVsTime.length - 1; ++i) {
                if (this.allPieceCountVsTime[i].x > this.allPieceCountVsTime[i + 1].x) {
                    this.endpointsofspecificPieceCountVsTime.push(i);
                }
            }
            this.endpointsofspecificPieceCountVsTime.push(this.allPieceCountVsTime.length - 1);
        },

        createGroupsOfPoints() {
            // Create data arrays that will be used for the all inclusive chart's tooltip
            this.groupsofpoints = [];
            this.coordinatesofgroups = [];

            for (let i in this.pieceCountVsTotalScore) {
                const coordinates = this.pieceCountVsTotalScore[i].x + ";" + this.pieceCountVsTotalScore[i].y;
                if (this.coordinatesofgroups.includes(coordinates)) {
                    this.groupsofpoints[this.coordinatesofgroups.indexOf(coordinates)].push(this.decodeScenario(i));
                } else {
                    this.groupsofpoints.push([this.decodeScenario(i)]);
                    this.coordinatesofgroups.push(coordinates);
                }
            }

            this.zeroindices = [];
            this.maxs = [];
            this.mins = [];

            for (let i of this.groupsofpoints) {
                this.zeroindices.push(i[0]);
                const min = [Infinity, Infinity, Infinity, Infinity, Infinity, Infinity, Infinity];
                const max = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];

                for (let j of i) {
                    for (let scenarioattribute = 0; scenarioattribute < 6; ++scenarioattribute) {
                        if (j[scenarioattribute] < min[scenarioattribute]) {
                            min[scenarioattribute] = j[scenarioattribute];
                        }
                        if (j[scenarioattribute] > max[scenarioattribute]) {
                            max[scenarioattribute] = j[scenarioattribute];
                        }
                    }
                }
                this.maxs.push(max);
                this.mins.push(min);
            }
        },

        // Chart initialization with staggered loading
        initializeChartsStaggered() {
            // Reset the queue and initialize charts one by one
            this.chartInitQueue = [
                { id: "psChart", type: "pschart", name: "Total Score vs Scenario" },
                { id: "piecesScoredchart", type: "piecesschart", name: "Pieces Scored vs Scenario" },
                { id: "scenarioChart", type: "scenariochart", name: "Pieces Scored vs Total Score" },
                { id: "rnkpntChart", type: "rnkpntchart", name: "Rank Points vs Scenario" },
                { id: "psotchart", type: "psotchart", name: "Pieces Scored vs Time" },
                { id: "myChart", type: "scoretimechart", name: "Score vs Time" }
            ];

            this.currentChartIndex = 0;
            this.processNextChart();
        },

        processNextChart() {
            if (this.currentChartIndex >= this.chartInitQueue.length) {
                // All charts initialized
                this.chartsInitialized = true;
                this.dataInitialized = true;
                this.loading = false;
                this.loadingMessage = "";
                return;
            }

            const chartInfo = this.chartInitQueue[this.currentChartIndex];
            this.loadingMessage = `Initializing chart ${this.currentChartIndex + 1} of ${this.chartInitQueue.length}: ${chartInfo.name}`;

            // Initialize the current chart
            this.initializeSingleChart(chartInfo.id, chartInfo.type);

            // Schedule the next chart initialization after the delay
            this.currentChartIndex++;
            setTimeout(() => {
                this.processNextChart();
            }, this.chartLoadDelay);
        },

        // New method to handle chart clicks
        handleChartClick(event) {
            const canvas = event.target;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const chart = this.charts.get(canvas.id);
            if (!chart) return;

            const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            if (points.length > 0) {
                const point = points[0];
                const data = chart.data.datasets[point.datasetIndex].data[point.index];
                this.updatedata(data.scenario || point.index);
            }
        },

        // Modified chart initialization method
        initializeSingleChart(canvasId, chartType) {
            try {
                const canvas = document.getElementById(canvasId);
                if (!canvas) {
                    console.error(`Canvas element ${canvasId} not found`);
                    return;
                }

                // Destroy existing chart if it exists
                if (this.charts.has(canvasId)) {
                    this.charts.get(canvasId).destroy();
                    this.charts.delete(canvasId);
                }

                // Common chart options
                const commonOptions = {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2, // This makes charts shorter
                    animation: {
                        duration: 750, // Reduced animation time
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                };

                // Initialize chart based on type
                let chart;
                switch (chartType) {
                    case "pschart":
                        chart = new Chart(canvas, {
                            type: "scatter",
                            data: {
                                datasets: [{
                                    pointRadius: 4,
                                    pointBackgroundColor: this.color,
                                    data: [...this.totalScoreVsScenario]
                                }]
                            },
                            options: {
                                ...commonOptions,
                                onClick: (e, elements) => {
                                    if (elements.length > 0) {
                                        const index = elements[0].index;
                                        this.updatedata(index);
                                    }
                                },
                                plugins: {
                                    ...commonOptions.plugins,
                                    title: {
                                        display: true,
                                        text: 'TOTAL SCORE - SCENARIO',
                                        font: {
                                            size: 16,
                                            weight: 'bold'
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (tooltipItem) => {
                                                return this.totalScoreVsScenario[tooltipItem.dataIndex]?.y || 0;
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Scenarios Encoded",
                                        },
                                        min: 0,
                                        max: this.numberOfScenarios - 1
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Total Score",
                                        },
                                        min: 0,
                                        max: 100
                                    }
                                }
                            }
                        });
                        break;

                    case "piecesschart":
                        chart = new Chart(canvas, {
                            type: "scatter",
                            data: {
                                datasets: [{
                                    pointRadius: 4,
                                    pointBackgroundColor: this.color,
                                    data: [...this.pieceCountVsScenario]
                                }]
                            },
                            options: {
                                ...commonOptions,
                                plugins: {
                                    ...commonOptions.plugins,
                                    title: {
                                        display: true,
                                        text: 'PIECES SCORED - SCENARIO',
                                        font: {
                                            size: 16,
                                            weight: 'bold'
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Scenarios Encoded",
                                        },
                                        min: 0,
                                        max: this.numberOfScenarios - 1
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Pieces Scored",
                                        },
                                        min: 0,
                                        max: 20
                                    }
                                }
                            }
                        });
                        break;

                    case "scenariochart":
                        chart = new Chart(canvas, {
                            type: "scatter",
                            data: {
                                datasets: [{
                                    pointRadius: 4,
                                    pointBackgroundColor: this.color,
                                    data: [...this.pieceCountVsTotalScore]
                                }]
                            },
                            options: {
                                ...commonOptions,
                                plugins: {
                                    ...commonOptions.plugins,
                                    title: {
                                        display: true,
                                        text: 'Pieces Scored/collected if stockpile - Total Score',
                                        font: {
                                            size: 16,
                                            weight: 'bold'
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Total Score",
                                        },
                                        min: 0,
                                        max: 100
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Pieces Scored/Collected if stockpile",
                                        },
                                        min: 0,
                                        max: 20
                                    }
                                }
                            }
                        });
                        break;

                    case "rnkpntchart":
                        chart = new Chart(canvas, {
                            type: "scatter",
                            data: {
                                datasets: [{
                                    pointRadius: 4,
                                    pointBackgroundColor: this.color,
                                    data: [...this.rnkValueVsScenario]
                                }]
                            },
                            options: {
                                ...commonOptions,
                                plugins: {
                                    ...commonOptions.plugins,
                                    title: {
                                        display: true,
                                        text: 'RANK POINTS - SCENARIO',
                                        font: {
                                            size: 16,
                                            weight: 'bold'
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Scenarios Encoded",
                                        },
                                        min: 0,
                                        max: this.numberOfScenarios - 1
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Rank Points",
                                        },
                                        min: 0,
                                        max: 3,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }
                        });
                        break;

                    case "psotchart":
                        chart = new Chart(canvas, {
                            type: "scatter",
                            data: {
                                datasets: [{
                                    pointRadius: 4,
                                    borderColor: this.specificColorOverTime.map(
                                        color => color == "rgb(255,255,255)" ? "rgb(0,0,0)" : color
                                    ),
                                    pointBackgroundColor: this.specificColorOverTime,
                                    data: [...this.specificPieceCountVsTime]
                                }]
                            },
                            options: {
                                ...commonOptions,
                                plugins: {
                                    ...commonOptions.plugins,
                                    title: {
                                        display: true,
                                        text: 'PIECES SCORED/collected if stockpile - TIME',
                                        font: {
                                            size: 16,
                                            weight: 'bold'
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Time",
                                        },
                                        min: 0,
                                        max: 150
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Pieces Scored/collected if stockpile",
                                        },
                                        min: 0,
                                        max: 20
                                    }
                                }
                            }
                        });
                        break;

                    case "scoretimechart":
                        chart = new Chart(canvas, {
                            type: "scatter",
                            data: {
                                datasets: [{
                                    pointRadius: 4,
                                    pointBackgroundColor: "#4dabf7",
                                    data: [...this.specificPointsVsTime]
                                }]
                            },
                            options: {
                                ...commonOptions,
                                plugins: {
                                    ...commonOptions.plugins,
                                    title: {
                                        display: true,
                                        text: 'SCORE - TIME',
                                        font: {
                                            size: 16,
                                            weight: 'bold'
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Time",
                                        },
                                        min: 0,
                                        max: 150
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Score",
                                        },
                                        min: 0,
                                        max: 100
                                    }
                                }
                            }
                        });
                        break;
                }

                // Store chart instance in the map
                if (chart) {
                    this.charts.set(canvasId, chart);
                }

            } catch (error) {
                console.error(`Error initializing chart ${canvasId}:`, error);
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    setTimeout(() => {
                        this.initializeSingleChart(canvasId, chartType);
                    }, 500);
                }
            }
        },
    }
};
</script>

<style>
.chart {
    max-width: 100%;
    height: 200px;
    /* Reduced height */
    margin-bottom: 20px;
    border-radius: 8px;
    background-color: #fff;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
    cursor: pointer;
    /* Add pointer cursor for clickable charts */
    transition: box-shadow 0.3s ease;
}

.chart:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Reset and base styles */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* Allow vertical scrolling */
body {
    overflow-y: auto;
    overflow-x: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8f9fa;
    color: #333;
    line-height: 1.6;
}

/* Main container */
.strategy-chart-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

/* Page title */
.page-title {
    width: 100%;
    text-align: center;
    margin-bottom: 25px;
    color: #2c3e50;
    font-size: 2.2rem;
    font-weight: 700;
    padding-bottom: 10px;
    border-bottom: 3px solid #e9ecef;
}

/* UI container */
.ui-container {
    margin-bottom: 25px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 15px;
    transition: all 0.3s ease;
}

.ui-container:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.ui-details {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.5em 0.5em 0;
    background-color: #f8f9fa;
}

.ui-summary {
    font-weight: bold;
    margin: -0.5em -0.5em 0;
    padding: 0.8em;
    cursor: pointer;
    background-color: #4dabf7;
    color: white;
    border-radius: 8px 8px 0 0;
    transition: background-color 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ui-summary:hover {
    background-color: #3793dd;
}

.summary-text {
    font-size: 1rem;
}

.summary-icon {
    font-size: 0.8rem;
}

.ui-controls {
    padding: 15px 0;
    line-height: 2;
}

.input-group {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
}

.input-group label {
    margin-bottom: 5px;
    font-weight: 500;
    color: #495057;
}

.ui-input {
    margin: 5px 0;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.ui-input:focus {
    border-color: #4dabf7;
    outline: none;
    box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.25);
}

.calculate-button {
    background-color: #4dabf7;
    color: white;
    border: none;
    padding: 12px 24px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 15px 0 5px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.3s;
    font-weight: 500;
    width: 100%;
}

.calculate-button:hover {
    background-color: #3793dd;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.calculate-button:active {
    transform: translateY(0);
}

.button-text {
    font-weight: 600;
}

/* Split view container */
.split-view-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    height: auto;
    min-height: 80vh;
    overflow-x: hidden;
    gap: 20px;
}

.split-view-divider {
    width: 2px;
    height: auto;
    background-color: #dee2e6;
    margin: 0 10px;
}

.split-view {
    width: 47%;
    height: auto;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 20px;
    transition: all 0.3s ease;
}

.split-view:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
    margin-bottom: 20px;
    color: #2c3e50;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 8px;
    font-size: 1.5rem;
    font-weight: 600;
}

/* Scrollers */
.scroller {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding-bottom: 20px;
    scrollbar-width: thin;
    scrollbar-color: #ced4da #f8f9fa;
}

.scroller::-webkit-scrollbar {
    width: 8px;
}

.scroller::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 10px;
}

.scroller::-webkit-scrollbar-thumb {
    background-color: #ced4da;
    border-radius: 10px;
}

.scrollerOpen {
    padding-bottom: 200px;
}

/* Charts */
.chart-container {
    padding: 15px 0;
}

/* Keys */
.key-details {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.5em 0.5em 0;
    margin-bottom: 20px;
    background-color: #f8f9fa;
}

.key-summary {
    font-weight: 600;
    margin: -0.5em -0.5em 0;
    padding: 0.8em;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    background-color: #4dabf7;
    color: white;
    transition: background-color 0.2s;
}

.key-summary:hover {
    background-color: #3793dd;
}

.key-details[open] {
    padding: 0.8em;
}

.key-details[open] summary {
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 0.8em;
    border-radius: 8px 8px 0 0;
}

.key-list {
    list-style: none;
    padding-left: 10px;
}

.key-list li {
    margin: 8px 0;
    display: flex;
    align-items: center;
    font-size: 14px;
}

.key-mark {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin-right: 12px;
    border-radius: 4px;
}

/* Tables */
.table-responsive {
    overflow-x: auto;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    text-align: right;
    border-radius: 8px;
    overflow: hidden;
}

.data-table th {
    border: 1px solid #dee2e6;
    background: #4dabf7;
    text-align: center;
    padding: 12px;
    font-weight: 600;
    color: white;
}

.data-table td {
    border: 1px solid #dee2e6;
    padding: 10px;
    background-color: #fff;
}

.data-table tr:nth-child(even) td {
    background-color: #f8f9fa;
}

.ta-c {
    text-align: center;
}

.play-by-play {
    margin-bottom: 20px;
}

/* Tooltip container */
.tooltip-container {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

/* Scenario details */
.scenario-details {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.5em 0.5em 0;
    margin-bottom: 20px;
    background-color: #f8f9fa;
}

.scenario-summary {
    font-weight: 600;
    margin: -0.5em -0.5em 0;
    padding: 0.8em;
    cursor: pointer;
    background-color: #4dabf7;
    color: white;
    border-radius: 8px 8px 0 0;
    transition: background-color 0.2s;
}

.scenario-summary:hover {
    background-color: #3793dd;
}

.scenario-info {
    font-size: 15px;
    font-weight: normal;
    line-height: 1.6;
    padding: 10px;
    color: #495057;
}

/* Loading indicator */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4dabf7;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

.loading-text {
    font-size: 16px;
    color: #495057;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.hidden {
    display: none;
}

/* Responsive design */
@media (max-width: 1024px) {
    .split-view-container {
        flex-direction: column;
        gap: 30px;
    }

    .split-view {
        width: 100%;
        margin-bottom: 20px;
    }

    .split-view-divider {
        display: none;
    }

    .chart {
        height: 350px;
        /* Taller on tablets */
    }

    .page-title {
        font-size: 1.8rem;
    }
}

@media (max-width: 768px) {
    .strategy-chart-container {
        padding: 15px;
    }

    .ui-controls {
        padding: 10px 0;
    }

    .input-group {
        flex-direction: column;
    }

    .calculate-button {
        width: 100%;
        padding: 14px 20px;
    }

    .section-title {
        font-size: 1.3rem;
    }

    .data-table th,
    .data-table td {
        padding: 8px;
        font-size: 14px;
    }

    .chart {
        height: 300px;
        /* Adjusted for mobile */
    }
}

/* Touch-friendly adjustments for mobile */
@media (max-width: 480px) {

    .ui-summary,
    .key-details summary,
    .scenario-summary {
        padding: 12px;
    }

    .calculate-button {
        padding: 14px 20px;
        font-size: 16px;
    }

    .ui-input {
        padding: 12px;
        font-size: 16px;
        /* Larger font size for better touch targets */
    }

    .key-mark {
        width: 20px;
        height: 20px;
    }

    .chart {
        height: 250px;
        /* Smaller on mobile */
    }

    .page-title {
        font-size: 1.5rem;
    }
}
</style>