// Data visualization handler using D3.js
class DataVizHandler {
    constructor() {
        this.chartContainer = null;
        this.data = null;
        this.charts = {};
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupContainer();
    }

    loadData() {
        // Sample data - in production, load from aral-sea-data.json
        this.data = {
            waterLevel: [
                { year: 1999, level: 100, area: 68000 },
                { year: 2000, level: 95, area: 64600 },
                { year: 2005, level: 75, area: 51000 },
                { year: 2010, level: 45, area: 30600 },
                { year: 2015, level: 25, area: 17000 },
                { year: 2020, level: 15, area: 10200 },
                { year: 2024, level: 10, area: 6800 }
            ],
            fishCatch: [
                { year: 1999, catch: 40000, fishermen: 60000 },
                { year: 2005, catch: 15000, fishermen: 35000 },
                { year: 2010, catch: 2000, fishermen: 8000 },
                { year: 2015, catch: 0, fishermen: 0 },
                { year: 2020, catch: 0, fishermen: 0 },
                { year: 2024, catch: 0, fishermen: 0 }
            ],
            cottonProduction: [
                { year: 1999, production: 1000000, waterUsage: 50 },
                { year: 2005, production: 1500000, waterUsage: 75 },
                { year: 2010, production: 2000000, waterUsage: 90 },
                { year: 2015, production: 2200000, waterUsage: 95 },
                { year: 2020, production: 2100000, waterUsage: 85 },
                { year: 2024, production: 1800000, waterUsage: 70 }
            ],
            healthImpact: [
                { year: 1999, respiratory: 5, cancer: 2, infant_mortality: 15 },
                { year: 2005, respiratory: 15, cancer: 8, infant_mortality: 25 },
                { year: 2010, respiratory: 35, cancer: 20, infant_mortality: 45 },
                { year: 2015, respiratory: 55, cancer: 35, infant_mortality: 65 },
                { year: 2020, respiratory: 70, cancer: 50, infant_mortality: 80 },
                { year: 2024, respiratory: 75, cancer: 55, infant_mortality: 85 }
            ]
        };
    }

    setupContainer() {
        this.chartContainer = d3.select('#data-visualization');
        
        if (this.chartContainer.empty()) return;
        
        // Clear container
        this.chartContainer.html('');
        
        // Add chart tabs
        const tabsContainer = this.chartContainer
            .append('div')
            .attr('class', 'chart-tabs');
        
        const tabs = [
            { id: 'water-level', label: '💧 Water Decline', active: true },
            { id: 'fishing', label: '🐟 Fishing Industry' },
            { id: 'cotton', label: '🌱 Cotton Production' },
            { id: 'health', label: '🏥 Health Impact' }
        ];
        
        tabs.forEach((tab, i) => {
            tabsContainer
                .append('button')
                .attr('class', `chart-tab ${tab.active ? 'active' : ''}`)
                .attr('data-chart', tab.id)
                .html(tab.label)
                .on('click', () => this.showChart(tab.id));
        });
        
        // Add chart container
        const chartArea = this.chartContainer
            .append('div')
            .attr('class', 'chart-area');
    }

    initializeCharts() {
        if (!this.chartContainer || this.chartContainer.empty()) return;
        
        // Create all charts but show only the first one
        this.createWaterLevelChart();
        this.createFishingChart();
        this.createCottonChart();
        this.createHealthChart();
        
        // Show default chart
        this.showChart('water-level');
    }

    showChart(chartId) {
        // Update tab states
        this.chartContainer.selectAll('.chart-tab')
            .classed('active', function() {
                return d3.select(this).attr('data-chart') === chartId;
            });
        
        // Hide all charts
        this.chartContainer.selectAll('.chart')
            .style('display', 'none');
        
        // Show selected chart
        this.chartContainer.select(`#chart-${chartId}`)
            .style('display', 'block');
        
        // Animate chart
        this.animateChart(chartId);
    }

    createWaterLevelChart() {
        const chartId = 'water-level';
        const data = this.data.waterLevel;
        
        const margin = { top: 20, right: 30, bottom: 40, left: 70 };
        const width = 600 - margin.left - margin.right;
        const height = 300 - margin.bottom - margin.top;
        
        const chartDiv = this.chartContainer.select('.chart-area')
            .append('div')
            .attr('id', `chart-${chartId}`)
            .attr('class', 'chart');
        
        const svg = chartDiv.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.level)])
            .range([height, 0]);
        
        // Line generator
        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.level))
            .curve(d3.curveMonotoneX);
        
        // Add axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));
        
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));
        
        // Add axis labels
        g.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 35)
            .style('text-anchor', 'middle')
            .text('Year');
        
        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -50)
            .style('text-anchor', 'middle')
            .text('Water Level (% of 1999 level)');
        
        // Add area under curve
        const area = d3.area()
            .x(d => xScale(d.year))
            .y0(height)
            .y1(d => yScale(d.level))
            .curve(d3.curveMonotoneX);
        
        g.append('path')
            .datum(data)
            .attr('class', 'area')
            .attr('d', area)
            .style('fill', '#4a90e2')
            .style('opacity', 0.3);
        
        // Add line
        g.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke', '#4a90e2')
            .style('stroke-width', 3);
        
        // Add points
        g.selectAll('.dot')
            .data(data)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.year))
            .attr('cy', d => yScale(d.level))
            .attr('r', 5)
            .style('fill', '#4a90e2')
            .style('stroke', 'white')
            .style('stroke-width', 2);
        
        // Add tooltips
        const tooltip = d3.select('body').append('div')
            .attr('class', 'chart-tooltip')
            .style('display', 'none');
        
        g.selectAll('.dot')
            .on('mouseover', function(event, d) {
                tooltip.style('display', 'block')
                    .html(`
                        <strong>${d.year}</strong><br>
                        Water Level: ${d.level}%<br>
                        Area: ${d.area.toLocaleString()} km²
                    `);
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('display', 'none');
            });
        
        this.charts[chartId] = { svg, g, data };
    }

    createFishingChart() {
        const chartId = 'fishing';
        const data = this.data.fishCatch;
        
        const margin = { top: 20, right: 30, bottom: 40, left: 70 };
        const width = 600 - margin.left - margin.right;
        const height = 300 - margin.bottom - margin.top;
        
        const chartDiv = this.chartContainer.select('.chart-area')
            .append('div')
            .attr('id', `chart-${chartId}`)
            .attr('class', 'chart');
        
        const svg = chartDiv.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.year))
            .range([0, width])
            .padding(0.1);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.catch)])
            .range([height, 0]);
        
        // Add axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));
        
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));
        
        // Add bars
        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.year))
            .attr('y', d => yScale(d.catch))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.catch))
            .style('fill', '#e74c3c')
            .style('opacity', 0.8);
        
        this.charts[chartId] = { svg, g, data };
    }

    createCottonChart() {
        // Similar implementation for cotton production chart
        // Dual axis chart showing production vs water usage
        const chartId = 'cotton';
        // Implementation details...
    }

    createHealthChart() {
        // Multi-line chart showing health impacts over time
        const chartId = 'health';
        // Implementation details...
    }

    animateChart(chartId) {
        const chart = this.charts[chartId];
        if (!chart) return;
        
        // Animate based on chart type
        switch (chartId) {
            case 'water-level':
                this.animateLineChart(chart);
                break;
            case 'fishing':
                this.animateBarChart(chart);
                break;
            // Add other animations...
        }
    }

    animateLineChart(chart) {
        const { g } = chart;
        
        // Animate line drawing
        const path = g.select('.line');
        const totalLength = path.node().getTotalLength();
        
        path
            .attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(2000)
            .attr('stroke-dashoffset', 0);
        
        // Animate dots appearance
        g.selectAll('.dot')
            .style('opacity', 0)
            .transition()
            .duration(300)
            .delay((d, i) => i * 200)
            .style('opacity', 1);
    }

    animateBarChart(chart) {
        const { g } = chart;
        
        // Animate bars growing from bottom
        g.selectAll('.bar')
            .attr('height', 0)
            .attr('y', chart.height || 300)
            .transition()
            .duration(800)
            .delay((d, i) => i * 150)
            .attr('height', function() {
                return d3.select(this).attr('data-height') || 0;
            })
            .attr('y', function() {
                return d3.select(this).attr('data-y') || 0;
            });
    }
}

// Add CSS for charts
const chartStyles = document.createElement('style');
chartStyles.textContent = `
    .chart-tabs {
        display: flex;
        margin-bottom: 1rem;
        border-bottom: 2px solid #eee;
    }
    
    .chart-tab {
        padding: 0.5rem 1rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s;
        border-bottom: 2px solid transparent;
    }
    
    .chart-tab.active {
        color: #4a90e2;
        border-bottom-color: #4a90e2;
        background: rgba(74, 144, 226, 0.1);
    }
    
    .chart-area {
        min-height: 350px;
    }
    
    .chart {
        display: none;
    }
    
    .chart svg {
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
    }
    
    .axis-label {
        font-size: 14px;
        fill: #666;
    }
    
    .chart-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
    }
    
    .dot:hover {
        r: 7;
        cursor: pointer;
    }
`;
document.head.appendChild(chartStyles);

// Initialize and make available globally
window.dataVizHandler = new DataVizHandler();
