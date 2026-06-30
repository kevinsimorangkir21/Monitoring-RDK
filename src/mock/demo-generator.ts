/**
 * Demo file to showcase SetoranDataGenerator functionality
 * This file demonstrates the implementation of task 2.1
 */

import { SetoranDataGenerator } from './setoran';

// Create an instance of the generator
const generator = new SetoranDataGenerator();

// Demo 1: Generate configurable number of records (Requirements: 7.1, 7.2, 7.3)
console.log('=== Demo 1: Generate 10 records ===');
const tenRecords = generator.generateSetoranData(10);
console.log(`Generated ${tenRecords.length} records`);
console.log('Sample record:', tenRecords[0]);

console.log('\n=== Demo 2: Generate records for specific salesman ===');
const specificSalesmanData = generator.generateForSalesman(['Andi Wijaya', 'Budi Santoso'], 3);
console.log(`Generated ${specificSalesmanData.length} records for specific salesman`);
specificSalesmanData.forEach(record => {
    console.log(`${record.namaSalesman}: ${record.durasi} (${record.status})`);
});

console.log('\n=== Demo 3: Generate edge cases ===');
const edgeCases = generator.generateEdgeCases();
console.log(`Generated ${edgeCases.length} edge case records`);
edgeCases.forEach(record => {
    console.log(`${record.namaSalesman}: ${record.durasi} (${record.status}) - ${record.durasiSeconds}s`);
});

console.log('\n=== Demo 4: Generate data for date range ===');
const startDate = new Date('2025-01-01');
const endDate = new Date('2025-01-03');
const dateRangeData = generator.generateDateRange(startDate, endDate, 2);
console.log(`Generated ${dateRangeData.length} records for date range`);
dateRangeData.forEach(record => {
    console.log(`${record.tanggal}: ${record.namaSalesman} - ${record.durasi}`);
});

console.log('\n=== Demo 5: Available salesman names ===');
const availableSalesman = generator.getAvailableSalesman();
console.log(`Available salesman (${availableSalesman.length}):`, availableSalesman.slice(0, 5), '...');

// Verify data structure matches requirements
console.log('\n=== Verification: Required fields ===');
const sample = tenRecords[0];
const requiredFields = ['id', 'tanggal', 'salesman', 'pulangKunjungan', 'setoranKasir', 'durasi', 'bulan'];
const actualFields = Object.keys(sample);

console.log('Required fields for task 2.1:', requiredFields);
console.log('Generated record has fields:', actualFields);
console.log('All required fields present:', requiredFields.every(field => {
    // Map 'salesman' to 'namaSalesman' for compatibility
    const fieldToCheck = field === 'salesman' ? 'namaSalesman' : field;
    return actualFields.includes(fieldToCheck);
}));