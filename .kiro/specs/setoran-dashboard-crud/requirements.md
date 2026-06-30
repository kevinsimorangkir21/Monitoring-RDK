# Requirements Document

## Introduction

The Setoran Dashboard CRUD Enhancement extends the existing Setoran Dashboard to support complete Create, Read, Update, Delete operations for manual data entry by Super Admin users. This enhancement transforms the current read-only dashboard into a fully interactive data management interface while maintaining all existing analytics capabilities and ensuring real-time synchronization across all dashboard components.

## Glossary

- **CRUD_Operations**: Create, Read, Update, Delete operations for setoran data management
- **Super_Admin**: User role with full permissions to perform all CRUD operations on setoran data
- **Modal_Form**: Pop-up interface component for data entry and editing operations
- **Auto_Calculation**: Automatic computation of derived fields based on user input
- **Real_Time_Sync**: Immediate update of all dashboard components after CRUD operations
- **Validation_Engine**: System component that validates input data and business rules
- **API_Endpoints**: Backend REST API services for data persistence operations
- **Toast_Notifications**: User feedback system showing operation success/failure messages
- **Action_Column**: Table column containing edit and delete buttons for each record
- **Time_Picker**: User interface component for selecting time values
- **Date_Picker**: User interface component for selecting date values
- **Autocomplete_Select**: User interface component with searchable dropdown functionality
- **Loading_States**: Visual indicators showing ongoing operations to users
- **Confirmation_Dialog**: Modal dialog requesting user confirmation for destructive operations
- **Durasi**: Calculated time difference between Pulang_Kunjungan and Setoran_ke_Kasir
- **Setoran_Record**: Complete data object containing all setoran transaction information
- **Dashboard_Components**: All visual elements including KPI cards, charts, and tables

## Requirements

### Requirement 1: Implement Manual Data Entry Interface

**User Story:** As a Super Admin, I want to add new setoran records manually, so that I can input data that was not captured automatically.

#### Acceptance Criteria

1. THE Setoran_Dashboard SHALL display a "+ Tambah Setoran" button in the top-right corner of the page
2. WHEN the "+ Tambah Setoran" button is clicked, THE Modal_Form SHALL open with data entry fields
3. THE Modal_Form SHALL include required fields: Tanggal (Date_Picker), Nama Salesman (Autocomplete_Select), Pulang Kunjungan (Time_Picker), Setoran ke Kasir (Time_Picker)
4. THE Modal_Form SHALL auto-calculate Durasi field as the difference between Setoran ke Kasir and Pulang Kunjungan times
5. THE Modal_Form SHALL auto-generate Bulan field from the selected Tanggal value

### Requirement 2: Enforce Data Validation Rules

**User Story:** As a Super Admin, I want the system to validate my input, so that I can ensure data integrity and consistency.

#### Acceptance Criteria

1. THE Validation_Engine SHALL require all mandatory fields (Tanggal, Nama Salesman, Pulang Kunjungan, Setoran ke Kasir) to be filled
2. WHEN Setoran ke Kasir time is earlier than or equal to Pulang Kunjungan time, THE system SHALL display error message "Jam Setoran harus lebih besar dari Jam Pulang Kunjungan"
3. THE Validation_Engine SHALL prevent form submission when validation errors exist
4. THE Modal_Form SHALL display field-specific error messages near invalid inputs
5. THE Save button SHALL remain disabled until all validation rules are satisfied

### Requirement 3: Enable Record Editing Operations

**User Story:** As a Super Admin, I want to edit existing setoran records, so that I can correct inaccurate or outdated information.

#### Acceptance Criteria

1. THE Action_Column SHALL display an edit button (pencil icon from Lucide) for each table row
2. WHEN an edit button is clicked, THE Modal_Form SHALL open pre-populated with existing record data
3. THE Modal_Form SHALL allow modification of all editable fields while maintaining validation rules
4. WHEN save operation completes successfully, THE Toast_Notifications SHALL display "Data berhasil diperbarui."
5. THE updated record SHALL immediately reflect changes in the table and all Dashboard_Components

### Requirement 4: Implement Record Deletion with Confirmation

**User Story:** As a Super Admin, I want to delete incorrect setoran records, so that I can maintain accurate data in the system.

#### Acceptance Criteria

1. THE Action_Column SHALL display a delete button (trash icon from Lucide) for each table row
2. WHEN a delete button is clicked, THE Confirmation_Dialog SHALL appear asking user to confirm deletion
3. THE Confirmation_Dialog SHALL clearly indicate which record will be deleted (show salesman name and date)
4. WHEN deletion is confirmed and completes successfully, THE Toast_Notifications SHALL display "Data berhasil dihapus."
5. THE deleted record SHALL immediately disappear from the table and Dashboard_Components SHALL update accordingly

### Requirement 5: Provide Real-Time Dashboard Synchronization

**User Story:** As a Super Admin, I want all dashboard components to update immediately after CRUD operations, so that I can see the impact of my changes instantly.

#### Acceptance Criteria

1. WHEN a Create operation completes, THE KPI_Cards SHALL recalculate and display updated metrics without page reload
2. WHEN an Update operation completes, THE Chart_Components SHALL refresh to reflect modified data
3. WHEN a Delete operation completes, THE Detail_Table SHALL remove the record and update pagination if necessary
4. THE Daily Average Chart SHALL update its trend lines to reflect new, modified, or removed data points
5. THE Top 10 Terlama and Top 10 Tercepat charts SHALL recalculate rankings based on current dataset

### Requirement 6: Complete Missing KPI Card Implementation

**User Story:** As a manager, I want to see the total count of setoran records, so that I can understand the volume of transactions.

#### Acceptance Criteria

1. THE KPI_Cards SHALL include a fourth card displaying "Total Setoran" metric
2. THE Total_Setoran_Card SHALL show the count of all setoran records matching current filter criteria
3. WHEN filters are applied, THE Total_Setoran_Card SHALL update to show filtered record count
4. WHEN CRUD operations are performed, THE Total_Setoran_Card SHALL immediately reflect the new count
5. THE Total_Setoran_Card SHALL follow the same visual design as existing KPI cards

### Requirement 7: Implement Backend API Integration

**User Story:** As a developer, I want REST API endpoints for data persistence, so that CRUD operations can be properly saved and retrieved from the database.

#### Acceptance Criteria

1. THE API_Endpoints SHALL provide GET /api/setoran endpoint for retrieving all setoran records
2. THE API_Endpoints SHALL provide POST /api/setoran endpoint for creating new setoran records
3. THE API_Endpoints SHALL provide PUT /api/setoran/:id endpoint for updating existing setoran records
4. THE API_Endpoints SHALL provide DELETE /api/setoran/:id endpoint for deleting setoran records
5. THE backend SHALL validate all input data and return appropriate HTTP status codes and error messages

### Requirement 8: Provide User Feedback and Loading States

**User Story:** As a Super Admin, I want clear feedback about my operations, so that I know when actions are in progress or completed.

#### Acceptance Criteria

1. THE Loading_States SHALL display during Save, Update, and Delete operations
2. THE Toast_Notifications SHALL show "Data berhasil ditambahkan." when Create operation succeeds
3. THE Toast_Notifications SHALL show "Data berhasil diperbarui." when Update operation succeeds  
4. THE Toast_Notifications SHALL show "Data berhasil dihapus." when Delete operation succeeds
5. WHEN API operations fail, THE system SHALL display appropriate error messages to the user

### Requirement 9: Maintain Design System Consistency

**User Story:** As a user, I want the CRUD interface to match the existing design system, so that the user experience remains consistent.

#### Acceptance Criteria

1. THE Modal_Form SHALL use Wings Group design system components for all form elements
2. THE Action_Column buttons SHALL follow Wings Group icon button styling standards
3. THE Toast_Notifications SHALL use Wings Group notification component styling
4. THE Confirmation_Dialog SHALL follow Wings Group modal dialog design patterns
5. THE Loading_States SHALL use Wings Group loading indicator components

### Requirement 10: Ensure Automatic Duration Calculation Accuracy

**User Story:** As a Super Admin, I want the system to automatically calculate duration correctly, so that I don't need to compute time differences manually.

#### Acceptance Criteria

1. THE Auto_Calculation SHALL compute Durasi as the time difference between Setoran ke Kasir and Pulang Kunjungan
2. THE Durasi field SHALL display in HH:mm format (hours and minutes)
3. THE Auto_Calculation SHALL handle time calculations across different hours correctly
4. WHEN either time field changes, THE Durasi field SHALL immediately recalculate and update
5. THE backend API SHALL perform the same duration calculation to ensure data consistency

### Requirement 11: Support Salesman Autocomplete Functionality

**User Story:** As a Super Admin, I want to search and select salesman names easily, so that I can avoid typing errors and speed up data entry.

#### Acceptance Criteria

1. THE Autocomplete_Select SHALL display a searchable dropdown of available salesman names
2. WHEN typing in the salesman field, THE system SHALL filter salesman options based on the input text
3. THE Autocomplete_Select SHALL support both keyboard navigation and mouse selection
4. THE system SHALL validate that selected salesman exists in the available options list
5. THE salesman list SHALL be retrieved from the same data source used by existing dashboard filters

### Requirement 12: Maintain TypeScript and Build Compatibility

**User Story:** As a developer, I want the CRUD enhancement to maintain code quality standards, so that the application builds successfully without errors.

#### Acceptance Criteria

1. WHEN npm run build is executed, THE build process SHALL complete without TypeScript compilation errors
2. THE CRUD components SHALL use proper TypeScript interfaces for all data structures
3. THE API integration SHALL include proper type definitions for request and response objects
4. THE component implementations SHALL follow React and Next.js best practices
5. THE ESLint configuration SHALL pass without warnings for all new CRUD-related code

### Requirement 13: Implement Responsive CRUD Interface

**User Story:** As a Super Admin, I want to perform CRUD operations on different devices, so that I can manage data from mobile, tablet, or desktop interfaces.

#### Acceptance Criteria

1. THE Modal_Form SHALL adapt to different screen sizes while maintaining usability
2. THE Action_Column buttons SHALL remain accessible and properly sized on mobile devices
3. THE Toast_Notifications SHALL display appropriately on all screen sizes
4. THE Confirmation_Dialog SHALL be readable and functional on small screens
5. THE form layout SHALL stack appropriately on mobile while maintaining logical field grouping

### Requirement 14: Handle Edge Cases and Error Scenarios

**User Story:** As a Super Admin, I want the system to handle errors gracefully, so that I can understand what went wrong and take corrective action.

#### Acceptance Criteria

1. WHEN API calls fail due to network issues, THE system SHALL display appropriate error messages
2. WHEN attempting to delete a record that no longer exists, THE system SHALL handle the error gracefully
3. WHEN form validation fails, THE system SHALL clearly indicate which fields need correction
4. WHEN duplicate data is submitted, THE backend SHALL prevent creation and return descriptive error messages
5. THE system SHALL maintain data integrity even when multiple users perform CRUD operations simultaneously

### Requirement 15: Optimize Performance for Real-Time Updates

**User Story:** As a user, I want CRUD operations to feel responsive, so that I can work efficiently without delays.

#### Acceptance Criteria

1. THE Dashboard_Components SHALL update within 500ms of CRUD operation completion
2. THE system SHALL avoid unnecessary re-renders of unchanged components during updates
3. THE API calls SHALL implement appropriate caching strategies for frequently accessed data
4. THE chart re-calculations SHALL be optimized to handle datasets with hundreds of records efficiently
5. THE table updates SHALL maintain scroll position and selection state when possible after CRUD operations