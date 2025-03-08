<template>
    <div class="strategy-chart-container">
        <h1 class="page-title">Strategy Charts</h1>

        <div class="ui-container">
            <details open @toggle="inputToggled" class="ui-details">
                <summary class="ui-summary">UI: (click to open and close)</summary>
                <div id="ui" class="ui-controls"></div>
                <button id="recalculate" @click="calculate" class="calculate-button">Calculate</button>
            </details>
        </div>

        <div id="split-view-container" class="split-view-container">
            <div class="split-view">
                <h3 class="section-title">Strategy Comparison</h3>
                <details class="key-details">
                    <summary>Key:</summary>
                    <ul class="key-list">
                        <li><mark class="key-mark" style="background-color:rgb(0,255,0);"> </mark> : 3 RNKPNT</li>
                        <li><mark class="key-mark" style="background-color:rgb(255, 255, 0);"> </mark> : 2 RNKPNT</li>
                        <li><mark class="key-mark" style="background-color:rgb(255, 155, 0);"> </mark> : 1 RNKPNT</li>
                        <li><mark class="key-mark" style="background-color:rgb(255,0,0);"> </mark> : 0 RNKPNT</li>
                    </ul>
                </details>
                <div class="scroller">
                    <div class="chart-container">
                        <canvas id="psChart" class="chart"></canvas>
                        <canvas id="piecesScoredchart" class="chart"></canvas>
                        <p class="chart-note">Note that the color indicator for this graph is inaccurate b/c the points
                            overlap.</p>
                        <canvas id="scenarioChart" class="chart"></canvas>
                        <p id="shiftkey"></p>
                        <canvas id="rnkpntChart" class="chart"></canvas>
                    </div>
                </div>
            </div>
            <div id="split-view-divider" class="split-view-divider"></div>
            <div class="split-view">
                <h3 id="selectedScenario" class="section-title">Selected Scenario</h3>
                <div class="scroller scrollerOpen">
                    <p id="tooltip" class="tooltip-container"></p>
                    <div class="chart-container">
                        <details class="key-details">
                            <summary>Key:</summary>
                            <ul class="key-list">
                                <li><mark class="key-mark" style="background-color:rgb(0,0,0);"> </mark> : L4</li>
                                <li><mark class="key-mark" style="background-color:rgb(150, 150, 150);"> </mark> : L3
                                </li>
                                <li><mark class="key-mark" style="background-color:rgb(200, 200, 200);"> </mark> : L2
                                </li>
                                <li><mark class="key-mark"
                                        style="background-color:rgb(255,255,255); border: 1px solid black"> </mark> : L1
                                </li>
                            </ul>
                        </details>
                        <canvas id="psotchart" class="chart"></canvas>
                        <canvas id="myChart" class="chart"></canvas>
                        <h3 class="section-title">Coral Scored by Level</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Scoring Level</th>
                                    <th># Scored</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="ta-c">L4</td>
                                    <td id="L4_Scored"></td>
                                </tr>
                                <tr>
                                    <td class="ta-c">L3</td>
                                    <td id="L3_Scored"></td>
                                </tr>
                                <tr>
                                    <td class="ta-c">L2</td>
                                    <td id="L2_Scored"></td>
                                </tr>
                                <tr id="L1">
                                    <td class="ta-c">L1</td>
                                    <td id="L1_Scored"></td>
                                </tr>
                            </tbody>
                        </table>
                        <h3 class="section-title">Play by Play</h3>
                        <table id="table_id" class="data-table play-by-play">
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Time Left</th>
                                    <th>Elapsed Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Rows will be added dynamically -->
                            </tbody>
                        </table>
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
            // Constants
            doLinksExist: false,
            linkProgression: [2, 2, 2, 2, 2, 2, 2, 2], // represents how many pieces makes a link, next number in a array is how many pieces constitutes the 2nd link, and so on and so forth: like in the game steamworks
            // for the steamship game, linkProgression=[1,2,3,4,5];
            // points arrays are structured as [points for auton, points for teleop]
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
            // structure of piecesScoredForRnkPnt: [# of piecesScored[0] for RnkPnt,# of piecesScored[1] for RnkPnt]
            piecesScoredForRnkPnt: [20, 0],

            // put iterating arrays in an array for ease of change
            autonMovementName: 'Auton Movement (s) ["=Teleop" sets this to equal teleop movement]',
            iteratingArrays: [
                // order the values from least to greatest
                // ["path" , 0,1,2] // different paths mean different things
                ["Balance/Climb/Hang (s)", 5, 6],
                ["Output (s)", 1.5, 2, 2.5],
                ["Intake (s)", .75, 1, 1.25],
                ['Auton Movement (s) ["=Teleop" sets this to equal teleop movement]', "=Teleop"], // all the movement times include aligning
                ["Teleop Movement (s)", 5, 6, 7],
                ["Alliance robots leave auton (Boolean)", 0, 1],
                ["At least one alliance robot parks (Boolean)", 0, 1],
                ["Algae dislodge (s)", 1],
                // ["Stockpile Movement Fraction",1/2],
                ["Grab Amount (on average)", 1],
            ],

            // don't want to show grabAmount if it can only equal one, but it's still important, so it's hidden:
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
            scoretimechart: null,

            // Flag to track if data has been initialized
            dataInitialized: false
        };
    },
    mounted() {
        this.initializeData();
    },
    methods: {
        l(..._) {
            console.log(..._);
        },
        inputToggled() {
            const scroller1 = document.getElementsByClassName('scroller')[0];
            const scroller2 = document.getElementsByClassName('scroller')[1];
            if (scroller1.classList.contains('scrollerOpen')) {
                scroller1.classList.remove('scrollerOpen');
                scroller2.classList.remove('scrollerOpen');
            } else {
                scroller1.classList.add('scrollerOpen');
                scroller2.classList.add('scrollerOpen');
            }
        },
        initializeData() {
            // Initialize from sessionStorage if available
            if (sessionStorage.getItem('iteratingArrays')) {
                this.iteratingArrays = JSON.parse(sessionStorage.getItem('iteratingArrays'));
            }

            // Calculate maxDecimals
            const numbersToCheck = this.iteratingArrays.flat(1).filter(i => typeof i !== 'string');
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

            // Generate all scenarios data
            this.generateScenariosData();

            // Calculate endpoints
            this.calculateEndpoints();

            // Create groups of points
            this.createGroupsOfPoints();

            // Update data for first scenario
            this.updatedata(0);

            // Initialize charts
            this.$nextTick(() => {
                if (!this.dataInitialized) {
                    this.initializeCharts();
                    this.dataInitialized = true;
                } else {
                    this.updateCharts();
                }
            });
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
            ui.innerHTML = '';
            for (let i = 0; i < this.iteratingArrays.length; ++i) {
                if (i >= this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset) {
                    ui.innerHTML += "<div style='display:none'>" +
                        this.iteratingArrays[i][0] + ": " +
                        `<input id="ui${i}" value="${this.iteratingArrays[i].slice(1)}" ><br>
              </div>`;
                } else {
                    ui.innerHTML +=
                        `<div class="input-group">
                <label for="ui${i}">${this.iteratingArrays[i][0]}:</label>
                <input id="ui${i}" value="${this.iteratingArrays[i].slice(1)}" class="ui-input">
              </div>`;
                }
            }
        },
        calculate() {
            for (let i in this.iteratingArrays) {
                let arr;

                if (this.iteratingArrays[i][0] === this.autonMovementName && document.getElementById("ui" + i).value === "=Teleop") {
                    this.iteratingArrays[i] = [this.autonMovementName, "=Teleop"];
                } else {
                    arr = [this.iteratingArrays[i][0]];
                    arr.push(...document.getElementById("ui" + i).value.split(',').map(Number)); // Split the string by commas and convert each part to a number
                    this.iteratingArrays[i] = arr;
                }
            }
            sessionStorage.setItem('iteratingArrays', JSON.stringify(this.iteratingArrays));

            // Instead of reloading the page, reinitialize the data
            this.initializeData();
        },
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
        updatedata(scenario) {
            const visibleDecodeScenario = this.decodeScenario(scenario).substring(0, this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset);

            const scenarioStringified = this.iteratingArrays.slice(0, this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset)
                .map(([key, ...values]) => key + ": " +
                    (values[visibleDecodeScenario.at(key)] ?? (values[0] === "=Teleop" ? "=Teleop" : values[0]))
                ).join('<br>');

            document.getElementById("selectedScenario").innerHTML =
                "<details open class='scenario-details'>" +
                "<summary class='scenario-summary'> Selected Scenario: " + scenario + " - " + visibleDecodeScenario + "</summary>" +
                "<p class='scenario-info'>" + scenarioStringified + "</p>" +
                "</details>";

            for (let i in this.scenarioTimes) {
                if (this.scenarioTimes[i] && this.scenarioTimes[i].includes("-")) {
                    document.write("problem: a scenario takes longer than 2:30");
                    this.scenarioAction[i] -= 0;
                }
            }

            let scenarioDecoded = scenario;
            if (typeof (scenario) === "string") {
                scenarioDecoded = this.encodeScenario(scenario); // this will allow the "arg: scenario" to be entered in string format or integer format
            }

            const startpoint = this.endpoints[scenarioDecoded] + 1; // an accessor
            const endpoint = this.endpoints[scenarioDecoded + 1];
            const startpointofspecificPieceCountVsTime = this.endpointsofspecificPieceCountVsTime[scenarioDecoded] + 1; // an accessor
            const endpointofspecificPieceCountVsTime = this.endpointsofspecificPieceCountVsTime[scenarioDecoded + 1];

            // empty out the data arrays
            this.specificPointsVsTime.splice(0, this.specificPointsVsTime.length);
            this.specificPieceCountVsTime.splice(0, this.specificPieceCountVsTime.length);
            this.specificColorOverTime.splice(0, this.specificColorOverTime.length);

            // for each point in the given range, push a point to the specificPointsVsTime array
            for (let i = startpoint; i < endpoint + 1; i++) {
                this.specificPointsVsTime.push(this.allPointsVsTime[i]);
            }

            for (let i = startpointofspecificPieceCountVsTime; i < endpointofspecificPieceCountVsTime + 1; i++) {
                this.specificPieceCountVsTime.push(this.allPieceCountVsTime[i]);
                this.specificColorOverTime.push(this.allColorOverTime[i]);
            }

            let string_copy = "";
            let string_copy2 = "";

            if (this.scenarioAction[scenarioDecoded]) {
                for (let i in this.scenarioAction[scenarioDecoded]) {
                    string_copy += this.scenarioAction[scenarioDecoded][i];
                }
            }

            if (this.scenarioTimes[scenarioDecoded]) {
                for (let i in this.scenarioTimes[scenarioDecoded]) {
                    string_copy2 += this.scenarioTimes[scenarioDecoded][i];
                }
            }

            let table = document.getElementById("table_id");
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }

            while (string_copy.length > 0) {
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
                document.getElementById("table_id").appendChild(tr);
            }

            let totalL4 = this.specificColorOverTime.filter((a) => a == 'rgb(0,0,0)').length;
            let totalL3 = this.specificColorOverTime.filter((a) => a == 'rgb(150,150,150)').length;
            let totalL2 = this.specificColorOverTime.filter((a) => a == 'rgb(200,200,200)').length;
            let totalL1 = this.specificColorOverTime.filter((a) => a == 'rgb(255,255,255)').length;

            document.getElementById('L1_Scored').innerHTML = totalL1;
            document.getElementById('L2_Scored').innerHTML = totalL2;
            document.getElementById('L3_Scored').innerHTML = totalL3;
            document.getElementById('L4_Scored').innerHTML = totalL4;

            // Update charts if they exist
            if (this.dataInitialized) {
                this.updateCharts();
            }
        },
        updateCharts() {
            // Update chart data
            if (this.psotchart) {
                this.psotchart.data.datasets[0].data = this.specificPieceCountVsTime;
                this.psotchart.data.datasets[0].pointBackgroundColor = this.specificColorOverTime;
                this.psotchart.data.datasets[0].borderColor = this.specificColorOverTime.map(
                    color => { return color == "rgb(255,255,255)" ? "rgb(0,0,0)" : color; }
                );
                this.psotchart.update();
            }

            if (this.scoretimechart) {
                this.scoretimechart.data.datasets[0].data = this.specificPointsVsTime;
                this.scoretimechart.update();
            }

            if (this.scenariochart) {
                this.scenariochart.data.datasets[0].data = this.pieceCountVsTotalScore;
                this.scenariochart.data.datasets[0].pointBackgroundColor = this.color;
                this.scenariochart.update();
            }

            if (this.rnkpntchart) {
                this.rnkpntchart.data.datasets[0].data = this.rnkValueVsScenario;
                this.rnkpntchart.data.datasets[0].pointBackgroundColor = this.color;
                this.rnkpntchart.update();
            }

            if (this.pschart) {
                this.pschart.data.datasets[0].data = this.totalScoreVsScenario;
                this.pschart.data.datasets[0].pointBackgroundColor = this.color;
                this.pschart.update();
            }

            if (this.piecesschart) {
                this.piecesschart.data.datasets[0].data = this.pieceCountVsScenario;
                this.piecesschart.data.datasets[0].pointBackgroundColor = this.color;
                this.piecesschart.update();
            }
        },
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
        generateScenariosData() {
            // Create a scenario tree
            for (let i = 0; i < this.numberOfScenarios; ++i) {
                const scenarioDecoded = this.decodeScenario(i);
                for (let j in this.iteratingArrays) {
                    this.scenario[this.iteratingArrays[j][0]] = this.iteratingArrays[j][Number(scenarioDecoded.charAt(j)) + 1];
                }

                // This can be optimized if put outside of scenario tree loop in calculate
                for (let i of this.iteratingArrays) {
                    if (i[0] == this.autonMovementName && i[1] == "=Teleop") {
                        this.scenario[this.autonMovementName] = this.scenario["Teleop Movement (s)"];
                        break;
                    }
                }

                // Initialize the variables
                // Last value set to 0 to keep track of what threshold the bot is up to
                this.piecesScored[0] = 0;
                this.holdingPiece[0] = 1; // Start w/ holding one piece
                // holdingPiece[1]=1; // For a 2nd game piece
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
                // this.scenarioAction[i] = (this.scenarioAction[i] ?? "") + "start of teleop;";
                // this.scenarioTimes[i] = (this.scenarioTimes[i] ?? "") + "135;";

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
                } // This doesn't count the time it takes to go from the charge station into the grid, which is bad for games when the place where mobility points are awarded is far away from a goal

                // this.scenario.time -= this.scenario["Teleop Movement (s)"];
                while (
                    this.scenario.time - this.scenario["Teleop Movement (s)"] - this.scenario["Output (s)"] - this.scenario["Intake (s)"] - this.scenario["Balance/Climb/Hang (s)"] * (this.pointsForBalancing[1] > 0)
                    - this.scenario['Algae dislodge (s)'] * (this.piecesScored[0] == 5 || this.piecesScored[0] == 7 || this.piecesScored[0] == 9)
                    >= 0
                ) { // If we want the program to see how much slower we can be w/out worsening score changing the 0 in ">=0" to some other number is a start.
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
                // this.scenario.time -= this.scenario["Output (s)"] + this.scenario["Intake (s)"];
                // this.scenario.points += this.pointsForTrap[1];
                // Since don't want to add to points scored, don't write "score"
                // this.addPlotData(i, "scor_d trap");

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
            }
        },
        calculateEndpoints() {
            // Figure out which scenario each set of scatter points belongs to by defining the endpoints of each scenario
            // i.e. where one scenario stops and a new one starts.
            // To define where the endpoints will appear, loop through each value in the allPointsVsTime,
            // which holds coordinate points for everytime the bot scores points for each scenario.
            // When the points-value (aka y-property) of one coordinate pair is less than the points of another coordinate pair,
            // there must be a new scenario.
            this.endpoints = [-1]; // It's -1 b/c it's the ending-point in a scenario where nothing happens
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
                // If the coordinates already exists in coordinatesofgroups, then just need to add these coordinates to the list.
                // Otherwise, need to create the said array before pushing it into the array.
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
        initializeCharts() {
            // Initialize scenarioChart
            this.scenariochart = new Chart("scenarioChart", {
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: this.color,
                        data: this.pieceCountVsTotalScore,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Pieces Scored/collected if stockpile - Total Score',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        tooltip: {
                            bodyFont: {
                                weight: "bold"
                            },
                            footerFont: {
                                weight: "normal"
                            },
                            callbacks: {
                                label: (tooltipItem) => {
                                    // If this is the first point in a group, than activate all the details for that group
                                    const scenario = this.decodeScenario(tooltipItem.dataIndex);
                                    if (this.zeroindices.includes(scenario)) {
                                        document.getElementById("tooltip").innerHTML = "";

                                        let scenarios = this.groupsofpoints[this.zeroindices.indexOf(scenario)];
                                        const lessEfficientIndices = [];
                                        for (let i = 0; i < scenarios.length - 1; ++i) {
                                            for (let j = i + 1; j < scenarios.length - 1; ++j) {
                                                if (j == i) continue;

                                                let iIsLessEfficientThanJ = false;
                                                let iIsMoreEfficientThanJ = false;
                                                for (let k in this.iteratingArrays) {
                                                    if (scenarios[i][k] > scenarios[j][k]) iIsMoreEfficientThanJ = true;
                                                    if (scenarios[i][k] < scenarios[j][k]) iIsLessEfficientThanJ = true;
                                                }
                                                if (iIsLessEfficientThanJ && !iIsMoreEfficientThanJ) lessEfficientIndices.push(i);
                                                else if (!iIsLessEfficientThanJ && iIsMoreEfficientThanJ) lessEfficientIndices.push(j);
                                            }
                                        }
                                        for (let i = 0; i < scenarios.length - 1; ++i) {
                                            if (lessEfficientIndices.includes(i)) continue;
                                            const detail = document.createElement("details");
                                            document.getElementById("tooltip").appendChild(detail);
                                            let details = "<summary>" + scenarios[i].substring(0, this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset) + "</summary>";
                                            for (let j = 0; j < this.iteratingArrays.length; ++j) {
                                                if (j >= this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset) {
                                                    // details += this.iteratingArrays[j][0] + ": " + this.iteratingArrays[j][Number(scenarios[i].charAt(j)) + 1] + "<br>";
                                                    break;
                                                } else {
                                                    details += this.iteratingArrays[j][0] + ": " + this.iteratingArrays[j][Number(scenarios[i].charAt(j)) + 1] + "<br>";
                                                }
                                            }
                                            detail.innerHTML = details;
                                        }
                                    }
                                },
                                // When points overlap, can only have one footer, but multiple labels.
                                footer: (tooltipItems) => {
                                    return [
                                        "Total Score: " + this.pieceCountVsTotalScore[tooltipItems[0].dataIndex].x,
                                        "Pieces Scored: " + this.pieceCountVsTotalScore[tooltipItems[0].dataIndex].y,
                                        "Scenarios that exist: " + this.groupsofpoints[this.zeroindices.indexOf(this.decodeScenario(tooltipItems[0].dataIndex))].length
                                    ];
                                }
                            }
                        }
                    },
                    onClick: (evt, elements, chart) => {
                        if (event.shiftKey) {
                            /*const element = this.scenariochart.getElementAtEvent(evt);
                            if (element.length > 0) {
                              const ind = element[0]._index;
                              if(!this.zeroIndicesPointsClicked.includes(ind)){//if not already included
                                this.zeroIndicesPointsClicked.push(ind);
                                //somehow maybe highlight it?
                                
                                this.pointsClicked.push([]);
                                for(let i of this.groupsofpoints[ind]){
                                  this.pointsClicked[this.pointsClicked.length-1].push(i);
                                }
                                document.getElementById("shiftkey").innerHTML=this.pointsClicked;
                              }
                              else{
                                this.pointsClicked.splice(this.zeroIndicesPointsClicked.indexOf(ind));
                                this.zeroIndicesPointsClicked.splice(this.zeroIndicesPointsClicked.indexOf(ind));
                                document.getElementById("shiftkey").innerHTML=this.pointsClicked;
                              }
                            }*/
                        } else {
                            this.zeroIndicesPointsClicked.splice(0, this.zeroIndicesPointsClicked.length);
                            this.pointsClicked.splice(0, this.pointsClicked.length);
                            document.getElementById("shiftkey").innerHTML = "";
                            if (elements.length > 0) {
                                const ind = elements[0].index;
                                if (confirm('Do you want to see this scenario?')) {
                                    console.log(ind);
                                    this.updatedata(ind);

                                    var ctx = document.getElementById('psotchart').getContext('2d');
                                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                                    this.updateCharts();
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Total Score",
                            },
                            min: this.pieceCountVsTotalScore.length > 0 ? this.pieceCountVsTotalScore[this.pieceCountVsTotalScore.length - 1].x : 0,
                            max: this.pieceCountVsTotalScore.length > 0 ? this.pieceCountVsTotalScore[0].x : 100,
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Pieces Scored/Collected if stockpile",
                            },
                            min: this.pieceCountVsTotalScore.length > 0 ? this.pieceCountVsTotalScore[this.pieceCountVsTotalScore.length - 1].y : 0,
                            max: this.pieceCountVsTotalScore.length > 0 ? this.pieceCountVsTotalScore[0].y : 20,
                        }
                    }
                }
            });

            // Initialize rnkpntChart
            this.rnkpntchart = new Chart("rnkpntChart", {
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: this.color,
                        data: this.rnkValueVsScenario
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'RANK POINTS - SCENARIO',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        tooltip: {
                            bodyFont: {
                                weight: "bold"
                            },
                            footerFont: {
                                weight: "normal"
                            },
                            callbacks: {
                                label: (tooltipItem) => {
                                    if (this.rnkValueVsScenario[tooltipItem.dataIndex].y === 0) { return "0"; } // There was a bug where if it was 0, then nothing it wouldn't show this
                                    return this.rnkValueVsScenario[tooltipItem.dataIndex].y;
                                },
                                // Color does not appear before the footer
                                footer: (tooltipItems) => {
                                    return this.iteratingArrays.slice(0, this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset)
                                        .map(
                                            ([key, ...values], indexOfMap) =>
                                                key + ": " + values[this.decodeScenario(tooltipItems[0].dataIndex).charAt(indexOfMap)]
                                        );
                                }
                            }
                        }
                    },
                    onClick: (evt, elements) => {
                        if (elements.length > 0) {
                            const ind = elements[0].index;
                            if (confirm('Do you want to see this scenario?')) {
                                this.updatedata(ind);
                                try {
                                    this.updateCharts();
                                } catch (error) {
                                    console.log(error);
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

            // Initialize psChart
            this.pschart = new Chart("psChart", {
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: this.color,
                        data: this.totalScoreVsScenario
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'TOTAL SCORE - SCENARIO',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        tooltip: {
                            bodyFont: {
                                weight: "bold"
                            },
                            footerFont: {
                                weight: "normal"
                            },
                            callbacks: {
                                label: (tooltipItem) => {
                                    return this.totalScoreVsScenario[tooltipItem.dataIndex].y;
                                },
                                // Color does not appear before the footer
                                footer: (tooltipItems) => {
                                    return this.iteratingArrays.slice(0, this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset)
                                        .map(
                                            ([key, ...values], indexOfMap) =>
                                                key + ": " + values[this.decodeScenario(tooltipItems[0].dataIndex).charAt(indexOfMap)]
                                        );
                                }
                            }
                        }
                    },
                    onClick: (evt, elements) => {
                        if (elements.length > 0) {
                            const ind = elements[0].index;
                            if (confirm('Do you want to see this scenario?')) {
                                this.updatedata(ind);
                                this.updateCharts();
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
                            min: this.totalScoreVsScenario.length > 0 ? this.totalScoreVsScenario[this.totalScoreVsScenario.length - 1].y : 0,
                            max: this.totalScoreVsScenario.length > 0 ? this.totalScoreVsScenario[0].y : 100
                        }
                    }
                }
            });

            // Initialize piecesScoredChart
            this.piecesschart = new Chart("piecesScoredchart", {
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: this.color,
                        data: this.pieceCountVsScenario
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'PIECES SCORED - SCENARIO',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        tooltip: {
                            bodyFont: {
                                weight: "bold"
                            },
                            footerFont: {
                                weight: "normal"
                            },
                            callbacks: {
                                label: (tooltipItem) => {
                                    return this.pieceCountVsScenario[tooltipItem.dataIndex].y;
                                },
                                // Color does not appear before the footer
                                footer: (tooltipItems) => {
                                    return this.iteratingArrays.slice(0, this.iteratingArrays.length - this.iteratingArraysVisibleInputOffset)
                                        .map(
                                            ([key, ...values], indexOfMap) =>
                                                key + ": " + values[this.decodeScenario(tooltipItems[0].dataIndex).charAt(indexOfMap)]
                                        );
                                }
                            }
                        }
                    },
                    onClick: (evt, elements) => {
                        if (elements.length > 0) {
                            const ind = elements[0].index;
                            if (confirm('Do you want to see this scenario?')) {
                                this.updatedata(ind);
                                this.updateCharts();
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
                            min: this.pieceCountVsScenario.length > 0 ? this.pieceCountVsScenario[this.pieceCountVsScenario.length - 1].y : 0,
                            max: this.pieceCountVsScenario.length > 0 ? this.pieceCountVsScenario[0].y : 20
                        }
                    }
                }
            });

            // Initialize psotChart
            this.psotchart = new Chart("psotchart", {
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        borderColor: this.specificColorOverTime.map(
                            color => { return color == "rgb(255,255,255)" ? "rgb(0,0,0)" : color; }
                        ),
                        pointBackgroundColor: this.specificColorOverTime,
                        data: this.specificPieceCountVsTime
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
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
                            max: this.pieceCountVsScenario.length > 0 ? this.pieceCountVsScenario[0].y : 20
                        }
                    }
                }
            });

            // Initialize scoreTimeChart
            this.scoretimechart = new Chart("myChart", {
                type: "scatter",
                data: {
                    datasets: [{
                        pointRadius: 4,
                        pointBackgroundColor: "rgb(0,0,255)",
                        data: this.specificPointsVsTime
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
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
                            max: this.totalScoreVsScenario.length > 0 ? this.totalScoreVsScenario[0].y : 100
                        }
                    }
                }
            });
        }
    }
};
</script>

<style>
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
    background-color: #e9ecef;
    border-radius: 8px 8px 0 0;
    transition: background-color 0.2s;
}

.ui-summary:hover {
    background-color: #dee2e6;
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
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
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
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 15px 0 5px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.3s;
    font-weight: 500;
}

.calculate-button:hover {
    background-color: #3793dd;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.calculate-button:active {
    transform: translateY(0);
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

.chart {
    max-width: 100%;
    margin-bottom: 30px;
    border-radius: 8px;
    background-color: #fff;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.chart-note {
    font-size: 0.9rem;
    color: #6c757d;
    margin: -20px 0 20px;
    font-style: italic;
    padding-left: 10px;
    border-left: 3px solid #e9ecef;
}

/* Keys */
.key-details {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 0.5em 0.5em 0;
    margin-bottom: 20px;
    background-color: #f8f9fa;
}

.key-details summary {
    font-weight: 600;
    margin: -0.5em -0.5em 0;
    padding: 0.8em;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    background-color: #e9ecef;
    transition: background-color 0.2s;
}

.key-details summary:hover {
    background-color: #dee2e6;
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
.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
    text-align: right;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    overflow: hidden;
}

.data-table th {
    border: 1px solid #dee2e6;
    background: #f8d62a;
    text-align: center;
    padding: 12px;
    font-weight: 600;
    color: #333;
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
    margin-bottom: 40px;
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
    background-color: #e9ecef;
    border-radius: 8px 8px 0 0;
    transition: background-color 0.2s;
}

.scenario-summary:hover {
    background-color: #dee2e6;
}

.scenario-info {
    font-size: 15px;
    font-weight: normal;
    line-height: 1.6;
    padding: 10px;
    color: #495057;
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
        max-width: 100%;
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
    }

    .section-title {
        font-size: 1.3rem;
    }

    .data-table th,
    .data-table td {
        padding: 8px;
        font-size: 14px;
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
        padding: 12px 20px;
        font-size: 16px;
    }

    .ui-input {
        padding: 10px;
        font-size: 16px;
        /* Larger font size for better touch targets */
    }

    .key-mark {
        width: 20px;
        height: 20px;
    }
}
</style>