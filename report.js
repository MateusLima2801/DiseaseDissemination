function countStates(dots) {
    const counts = {
        susceptible: 0,
        infected: 0,
        recovered: 0,
        dead: 0
    };

    dots.forEach(dot => {
        counts[dot.state]++;
    });

    return counts;
}

function captureDotStates(dots) {
    const currentStates = dots.map(dot => ({
        state: dot.state,
        infectedTime: dot.infectedTime,
        recoveryTime: dot.recoveryTime,
        deathTime: dot.deathTime,
    }));
   return currentStates
}

function downloadDotInfo(dotHistory) {
    const csvRows = [];
    
    // Add header row
    csvRows.push(['Tick', 'State', 'Infected Time', 'Recovery Time', 'Death Time'].join(','));

    // Loop through dot history and create rows for each tick
    dotHistory.forEach((dotList, index) => {
        dotList.forEach(dot => {
            const row = [
                index + 1,
                dot.state,
                dot.infectedTime?.toFixed(2) || 'N/A',
                dot.recoveryTime?.toFixed(2) || 'N/A',
                dot.deathTime?.toFixed(2) || 'N/A',
            ];
            csvRows.push(row.join(','));
        });
    });

    // Create a Blob from the CSV content
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'population_info.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}


export { captureDotStates, downloadDotInfo, countStates };
