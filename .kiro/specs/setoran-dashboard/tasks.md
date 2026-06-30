# Implementation Plan: Setoran Dashboard

## Overview

This implementation plan creates a comprehensive React-based analytics dashboard for monitoring salesman setoran (deposit) activities. The dashboard provides real-time insights through interactive visualizations, KPI cards, and detailed data tables using Next.js 15, TypeScript, and Recharts for visualization.

## Tasks

- [ ] 1. Set up project structure and core interfaces
  - Create directory structure for setoran dashboard under `src/app/admin/setoran/`
  - Define TypeScript interfaces in `types/setoran.ts` for SetoranRecord, SetoranFilters, SetoranKPIs, and chart data interfaces
  - Set up mock data service structure in `services/mock.ts`
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. Implement mock data generation service
  - [x] 2.1 Create SetoranDataGenerator class with realistic data generation
    - Implement generateSetoranData method with configurable record count
    - Include fields: id, tanggal, salesman, pulangKunjungan, setoranKasir, durasi, bulan
    - Generate realistic duration variations and salesman names
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 2.2 Add edge case data generation methods
    - Implement generateEdgeCases method for very short and long durations
    - Include boundary testing scenarios for filtering and calculations
    - Generate data spanning multiple months for comprehensive testing
    - _Requirements: 7.4, 7.5_

- [x] 3. Build core filter system components
  - [x] 3.1 Create FilterBar component with all filter controls
    - Implement date range picker for start/end date selection
    - Add month dropdown filter with available months from data
    - Create salesman multi-select dropdown with debounced search
    - Add text search input with 300ms debounce for performance
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 3.2 Write unit tests for FilterBar component
    - Test date range validation and state updates
    - Test dropdown filtering and search functionality
    - Test debounced search behavior and performance
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Implement KPI calculation and display system
  - [x] 4.1 Create SetoranCards component with four KPI metrics
    - Calculate and display Average Durasi (mean duration across filtered data)
    - Show Salesman Terlama (salesman with longest average duration)
    - Display Salesman Tercepat (salesman with shortest average duration)
    - Present Total Setoran (count of filtered setoran records)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 4.2 Write unit tests for KPI calculations
    - Test average duration calculation accuracy
    - Test ranking logic for longest/fastest salesman identification
    - Test edge cases with empty datasets and single records
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. Checkpoint - Ensure core data flow works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Build chart visualization components
  - [x] 6.1 Create DailyAverageChart component with Recharts LineChart
    - Implement ResponsiveContainer for automatic sizing adaptation
    - Configure smooth line curves with data point markers on Y-axis (duration) and X-axis (dates)
    - Add custom tooltips and date axis formatting
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 8.1, 8.2_
  
  - [x] 6.2 Implement TopLongestSalesmanChart with horizontal bar chart
    - Create horizontal BarChart showing top 10 salesman with longest average duration
    - Use red color scheme for warning indication of slow performance
    - Configure responsive bars with proper sizing and labels
    - _Requirements: 3.1, 3.2, 3.5, 8.1, 8.2_
  
  - [x] 6.3 Implement TopFastestSalesmanChart with horizontal bar chart
    - Create horizontal BarChart showing top 10 salesman with shortest average duration
    - Use green color scheme for success indication of fast performance
    - Configure responsive bars with proper sizing and labels
    - _Requirements: 3.1, 3.3, 3.5, 8.1, 8.2_
  
  - [x] 6.4 Create DurationDistributionChart with Recharts donut chart
    - Implement PieChart with donut configuration (inner radius for hole)
    - Categorize durations into ranges: 0-30min, 30-60min, 60-90min, 90min+
    - Display percentage labels and legend with color coding
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 8.1, 8.2_
  
  - [x] 6.5 Write unit tests for chart data transformations
    - Test daily average calculation and data grouping
    - Test salesman ranking logic and top-10 selection
    - Test duration distribution categorization and percentage calculations
    - _Requirements: 2.1, 3.1, 4.1, 4.2_

- [x] 7. Implement detailed data table component
  - [x] 7.1 Create SetoranTable component with responsive design
    - Display columns: Tanggal, Nama Salesman, Pulang Kunjungan, Setoran ke Kasir, Durasi
    - Implement responsive table layout for different screen sizes
    - Add pagination for large datasets with configurable page sizes
    - _Requirements: 5.1, 5.2, 5.5, 8.3, 8.4, 8.5_
  
  - [x] 7.2 Add table filtering and search highlighting
    - Implement search result highlighting in table cells
    - Ensure table updates when filters change
    - Add column sorting functionality for date and duration columns
    - _Requirements: 5.3, 5.4_
  
  - [x] 7.3 Write unit tests for table component
    - Test table filtering and data display
    - Test pagination and responsive behavior
    - Test search highlighting functionality
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Create main dashboard page and state management
  - [x] 8.1 Implement main page.tsx with dashboard coordination
    - Set up centralized filter state management with React hooks
    - Implement memoized data processing for performance optimization
    - Coordinate data flow to all child components (cards, charts, table)
    - Add responsive grid layout for mobile, tablet, and desktop
    - _Requirements: 6.5, 8.3, 8.4, 8.5_
  
  - [x] 8.2 Implement filter state synchronization system
    - Create useFilterCoordination hook for centralized filter management
    - Apply filters in correct order: date range → month → salesman → search
    - Ensure all dashboard widgets consume the same filtered dataset
    - Add filter reset and selective clearing operations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 8.3 Write integration tests for dashboard state management
    - Test filter application across all components simultaneously
    - Test state synchronization between filter bar and dashboard components
    - Test responsive layout behavior across different screen sizes
    - _Requirements: 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Apply Wings Group design system styling
  - [x] 9.1 Implement design system compliance across all components
    - Apply Wings Group color palette and typography standards
    - Use consistent spacing, border radius, and shadow patterns
    - Implement standard card design patterns for KPI cards
    - Style filter components using Wings Group form component standards
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 9.2 Ensure responsive design and accessibility compliance
    - Implement mobile-first responsive design approach
    - Ensure all chart elements remain accessible on small screens
    - Maintain proper contrast ratios and touch target sizes
    - Add proper ARIA labels and keyboard navigation support
    - _Requirements: 8.3, 8.4, 8.5_

- [x] 10. Final integration and build verification
  - [x] 10.1 Wire all components together in dashboard
    - Connect mock data service to dashboard state management
    - Ensure proper error boundary handling and loading states
    - Implement data refresh functionality for mock data regeneration
    - Verify all filter operations work correctly across components
    - _Requirements: 6.5, 7.1, 7.2, 7.3_
  
  - [x] 10.2 Verify build compatibility and TypeScript compliance
    - Execute npm run build to ensure no TypeScript errors
    - Verify proper component imports and type definitions
    - Test Recharts library integration and typing
    - Ensure React and Next.js best practices compliance
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 10.3 Write end-to-end integration tests
    - Test complete user workflows: filtering, chart interactions, table navigation
    - Verify responsive behavior across different device sizes
    - Test error states and loading indicators
    - _Requirements: 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP development
- Each task references specific requirements for traceability and validation
- Checkpoints ensure incremental validation at key development milestones
- The dashboard uses TypeScript with strict type checking throughout
- All charts implement ResponsiveContainer for adaptive layouts
- Mock data service provides comprehensive test scenarios including edge cases
- Filter system applies operations in optimized order for performance
- Design system compliance ensures visual consistency with Wings Group standards

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "6.1", "6.2", "6.3", "6.4"] },
    { "id": 4, "tasks": ["6.5", "7.1"] },
    { "id": 5, "tasks": ["7.2", "8.1"] },
    { "id": 6, "tasks": ["7.3", "8.2"] },
    { "id": 7, "tasks": ["8.3", "9.1"] },
    { "id": 8, "tasks": ["9.2", "10.1"] },
    { "id": 9, "tasks": ["10.2", "10.3"] }
  ]
}
```