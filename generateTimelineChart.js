const fs = require('fs');
const csv = require('csv-parser');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const moment = require('moment');

const width = 1000;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function generateTimelineChart() {
    const applications = [];

    fs.createReadStream('applications.csv')
        .pipe(csv())
        .on('data', (row) => {
            applications.push(row);
        })
        .on('end', async () => {
            console.log('CSV loaded!');

            const appliedMonthly = {};
            const rejectedMonthly = {};

            applications.forEach(app => {
                if (app.Status === 'Applied') {
                    const applyDate = moment(new Date(app.ApplyDate));
                    const month = applyDate.isValid() ? applyDate.format('YYYY-MM') : null;
                    if (month) {
                        appliedMonthly[month] = (appliedMonthly[month] || 0) + 1;
                    }
                } else if (app.Status === 'Rejected') {
                    const rejectionDate = moment(new Date(app.RejectionDate));
                    const month = rejectionDate.isValid() ? rejectionDate.format('YYYY-MM') : null;
                    if (month) {
                        rejectedMonthly[month] = (rejectedMonthly[month] || 0) + 1;
                    }
                }
            });

            // Combine months from both Applied and Rejected
            const months = Array.from(new Set([
                ...Object.keys(appliedMonthly),
                ...Object.keys(rejectedMonthly)
            ])).sort();

            const appliedCounts = months.map(month => appliedMonthly[month] || 0);
            const rejectedCounts = months.map(month => rejectedMonthly[month] || 0);

            const configuration = {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Applied',
                            data: appliedCounts,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Rejected',
                            data: rejectedCounts,
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Applications'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Month'
                            }
                        }
                    }
                }
            };

            const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
            fs.writeFileSync('./applications_timeline_chart.png', imageBuffer);
            console.log('Timeline chart updated and saved as applications_timeline_chart.png!');
        });
}

generateTimelineChart();
