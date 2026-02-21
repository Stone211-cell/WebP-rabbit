const http = require('http');

http.get('http://localhost:3000/api/visits?search=&sales=&startDate=&endDate=', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const visits = JSON.parse(data);
        console.log(`Fetch returned ${visits.length} items.`);
        const j_visits = visits.filter(v => v.sales === 'เจษฎา');
        console.log(`Jesada visits:`, j_visits.map(v => ({ dateStr: v.date, parsed: new Date(v.date).toISOString() })));
    });
}).on('error', err => console.log('Error:', err.message));
