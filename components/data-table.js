import DataTable from 'react-data-table-component';

export default function MyComponent(props) {
    return (
        <DataTable
            columns={props.columns}
            data={props.data}
            progressPending={props.progressPending}
            selectableRows={props.selectableRows}
            onSelectedRowsChange={props.onSelectedRowsChange}
            selectableRowDisabled={props.selectableRowDisabled}
            conditionalRowStyles={props.conditionalRowStyles}
        />
    );
};