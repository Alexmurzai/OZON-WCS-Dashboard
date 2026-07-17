export const downloadCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  
  // Extract headers
  const headers = ['ID', 'Category', 'Weight', 'Dimensions', 'Routing Zone', 'Timestamp'];
  
  // Create rows
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add headers
  
  for (const row of data) {
    const values = [
      row.id,
      row.category,
      row.weight,
      `${row.dimensions.x}x${row.dimensions.y}x${row.dimensions.z}`,
      row.routingZone,
      new Date(row.timestamp).toLocaleString()
    ];
    // Escape quotes and wrap in quotes if there are commas
    const escapedValues = values.map(v => {
      const stringValue = String(v);
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(escapedValues.join(','));
  }
  
  // Combine rows into a single string
  const csvString = csvRows.join('\n');
  
  // Create a Blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
