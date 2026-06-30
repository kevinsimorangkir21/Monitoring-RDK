# Requirements Document

## Introduction

The Setoran Dashboard is a comprehensive monitoring and analytics interface that provides real-time insights into salesman setoran (deposit) activities. The dashboard displays key performance indicators, visualizations, and detailed reporting to help management track and analyze salesman performance, duration metrics, and operational efficiency.

## Glossary

- **Setoran_Dashboard**: The main dashboard interface displaying setoran analytics and KPIs
- **KPI_Cards**: Four key performance indicator display components showing metrics summaries
- **Chart_Components**: Interactive data visualization components using Recharts library
- **Filter_System**: User interface controls for filtering and searching dashboard data
- **Mock_Data_Service**: Local data generation service providing sample setoran data
- **Duration**: Time elapsed between "Pulang Kunjungan" and "Setoran ke Kasir" activities
- **Salesman**: Field sales representative who performs customer visits and deposits
- **Pulang_Kunjungan**: Timestamp when salesman returns from customer visits
- **Setoran_ke_Kasir**: Timestamp when salesman makes deposit to cashier

## Requirements

### Requirement 1: Display Key Performance Indicators

**User Story:** As a manager, I want to view key performance metrics in card format, so that I can quickly assess overall setoran performance.

#### Acceptance Criteria

1. THE Setoran_Dashboard SHALL display four KPI cards in a responsive grid layout
2. THE KPI_Cards SHALL show Average Durasi with calculated mean duration across filtered data
3. THE KPI_Cards SHALL show Salesman Terlama with the salesman having longest average duration
4. THE KPI_Cards SHALL show Salesman Tercepat with the salesman having shortest average duration
5. THE KPI_Cards SHALL show Total Setoran with count of all setoran records in filtered dataset

### Requirement 2: Visualize Daily Duration Trends

**User Story:** As a manager, I want to see daily average duration trends in a line chart, so that I can identify patterns and anomalies over time.

#### Acceptance Criteria

1. THE Chart_Components SHALL render a Recharts LineChart showing daily average duration
2. THE LineChart SHALL use ResponsiveContainer for automatic sizing adaptation
3. WHEN date range filter changes, THE LineChart SHALL update to show data within selected period
4. THE LineChart SHALL display duration values on Y-axis and dates on X-axis
5. THE LineChart SHALL show smooth line curves with data point markers

### Requirement 3: Display Top Performer Rankings

**User Story:** As a manager, I want to see ranked lists of fastest and slowest salesman, so that I can identify top and bottom performers.

#### Acceptance Criteria

1. THE Chart_Components SHALL render two horizontal bar charts for salesman rankings
2. THE Top_Longest_Chart SHALL display top 10 salesman with longest average duration
3. THE Top_Fastest_Chart SHALL display top 10 salesman with shortest average duration
4. WHEN salesman filter is applied, THE ranking charts SHALL update to show filtered results
5. THE horizontal bar charts SHALL use ResponsiveContainer for responsive layout

### Requirement 4: Show Duration Distribution Analysis

**User Story:** As a manager, I want to see duration distribution in a donut chart, so that I can understand the spread of performance across duration ranges.

#### Acceptance Criteria

1. THE Chart_Components SHALL render a Recharts donut chart showing duration distribution
2. THE donut chart SHALL categorize durations into meaningful ranges (e.g., 0-30min, 30-60min, 60-90min, 90min+)
3. WHEN filters are applied, THE donut chart SHALL recalculate distribution based on filtered data
4. THE donut chart SHALL display percentage labels and legend for each duration category
5. THE donut chart SHALL use ResponsiveContainer for responsive sizing

### Requirement 5: Present Detailed Setoran Records

**User Story:** As a manager, I want to view detailed setoran records in a table format, so that I can examine individual transactions and performance details.

#### Acceptance Criteria

1. THE Setoran_Dashboard SHALL display a detailed data table with setoran records
2. THE data table SHALL include columns: Tanggal, Nama Salesman, Pulang Kunjungan, Setoran ke Kasir, Durasi
3. WHEN search filter is applied, THE table SHALL show only records matching the search criteria
4. WHEN any filter changes, THE table SHALL update to display filtered records
5. THE table SHALL support responsive design for different screen sizes

### Requirement 6: Enable Data Filtering and Search

**User Story:** As a manager, I want to filter and search setoran data, so that I can focus on specific time periods, salesman, or criteria.

#### Acceptance Criteria

1. THE Filter_System SHALL provide a date range picker for selecting start and end dates
2. THE Filter_System SHALL provide a month dropdown filter for selecting specific months
3. THE Filter_System SHALL provide a salesman dropdown filter for selecting specific salesman
4. THE Filter_System SHALL provide a text search input for searching by salesman name
5. WHEN any filter changes, THE Setoran_Dashboard SHALL update all charts, KPIs, and table simultaneously

### Requirement 7: Generate Mock Data Locally

**User Story:** As a developer, I want to use mock data for the dashboard, so that I can develop and test the interface without backend dependencies.

#### Acceptance Criteria

1. THE Mock_Data_Service SHALL generate realistic setoran sample data locally
2. THE mock data SHALL include fields: tanggal, nama_salesman, pulang_kunjungan, setoran_ke_kasir, durasi
3. THE Mock_Data_Service SHALL provide sufficient data variety for testing all chart types and filters
4. THE mock data SHALL include edge cases such as very short and very long durations
5. THE Mock_Data_Service SHALL generate data spanning multiple months for comprehensive testing

### Requirement 8: Implement Responsive Chart Layout

**User Story:** As a user, I want charts to adapt to different screen sizes, so that I can view the dashboard on various devices.

#### Acceptance Criteria

1. THE Chart_Components SHALL use Recharts ResponsiveContainer for all chart implementations
2. WHEN screen size changes, THE charts SHALL automatically resize while maintaining readability
3. THE dashboard layout SHALL adapt to mobile, tablet, and desktop screen sizes
4. THE chart containers SHALL maintain aspect ratios appropriate for each chart type
5. THE responsive design SHALL ensure all chart elements remain accessible on small screens

### Requirement 9: Follow Design System Standards

**User Story:** As a developer, I want to use Wings Group design system components, so that the dashboard maintains visual consistency with other applications.

#### Acceptance Criteria

1. THE Setoran_Dashboard SHALL use Wings Group design system color palette and typography
2. THE component styling SHALL follow Wings Group spacing, border radius, and shadow standards
3. THE KPI_Cards SHALL use consistent card design patterns from the design system
4. THE Filter_System SHALL use standard form components from Wings Group design system
5. THE overall layout SHALL maintain design system grid and container standards

### Requirement 10: Ensure Build Compatibility

**User Story:** As a developer, I want the dashboard to build without errors, so that it can be deployed successfully.

#### Acceptance Criteria

1. WHEN npm run build is executed, THE build process SHALL complete without TypeScript errors
2. THE component imports SHALL use correct TypeScript interfaces and type definitions
3. THE Recharts library integration SHALL be properly typed and imported
4. THE component structure SHALL follow React and Next.js best practices for successful compilation
5. THE mock data generation SHALL not cause runtime errors during build process