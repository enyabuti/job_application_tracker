const fs = require('fs');
const csv = require('csv-parser');

async function generateSQL() {
    const applications = [];

    fs.createReadStream('applications.csv')
        .pipe(csv())
        .on('data', (row) => {
            applications.push(row);
        })
        .on('end', () => {
            console.log('✅ CSV loaded!');

            let sql = `
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT,
    position TEXT,
    apply_date TEXT,
    status TEXT,
    rejection_date TEXT
);

`;

            applications.forEach(app => {
                sql += `INSERT INTO applications (company, position, apply_date, status, rejection_date)
VALUES (
    '${app.Company.replace(/'/g, "''")}',
    '${app.Position.replace(/'/g, "''")}',
    ${app.ApplyDate ? `'${app.ApplyDate}'` : `NULL`},
    '${app.Status}',
    ${app.RejectionDate ? `'${app.RejectionDate}'` : `NULL`}
);\n`;
            });

            fs.writeFileSync('applications.sql', sql);
            console.log('✅ SQL file saved as applications.sql!');
        });
}

generateSQL();
