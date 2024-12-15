import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	TextField,
} from '@mui/material';
import React, { ReactNode, useState } from 'react';

type DataType = { [key: string]: string | ReactNode };

const PaginatedFilteredTable = ({ data }: { data: DataType[] }) => {
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [page, setPage] = useState(0);
	const [order, setOrder] = useState<'asc' | 'desc'>('asc');
	const [orderBy, setOrderBy] = useState<string>('');
	const [filters, setFilters] = useState<{ [key: string]: string }>({});

	// Handle page change
	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	// Handle rows per page change
	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0); // Reset to first page
	};

	// Handle ordering
	const handleSort = (column: string) => {
		const isAsc = orderBy === column && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(column);
	};

	// Handle filtering
	const handleFilterChange = (column: string, value: string) => {
		setFilters((prev) => ({ ...prev, [column]: value }));
		setPage(0); // Reset to first page on filter
	};

	// Apply filtering
	const filteredData = data.filter((row) =>
		Object.keys(filters).every((column) =>
			filters[column]
				? row[column]
						?.toString()
						.toLowerCase()
						.includes(filters[column].toLowerCase())
				: true
		)
	);

	// Apply ordering
	const sortedData = [...filteredData].sort((a, b) => {
		if (!orderBy) return 0;
		const valueA = a[orderBy] as string;
		const valueB = b[orderBy] as string;
		if (valueA < valueB) return order === 'asc' ? -1 : 1;
		if (valueA > valueB) return order === 'asc' ? 1 : -1;
		return 0;
	});

	// Paginate data
	const paginatedData = sortedData.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	return (
		<Paper>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							{Object.keys(data[0] || {}).map((key) => (
								<TableCell key={key}>
									{key && (
										<>
											<TableSortLabel
												active={orderBy === key}
												direction={orderBy === key ? order : 'asc'}
												onClick={() => handleSort(key)}
											>
												{key}
											</TableSortLabel>
											<TextField
												variant="outlined"
												size="small"
												placeholder={`Filter ${key}`}
												value={filters[key] || ''}
												onChange={(e) =>
													handleFilterChange(key, e.target.value)
												}
												sx={{ marginTop: 1, width: '100%' }}
											/>
										</>
									)}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedData.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{Object.values(row).map((value, cellIndex) => (
									<TableCell key={cellIndex}>{value}</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[5, 10, 25]}
				component="div"
				count={sortedData.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</Paper>
	);
};

export default PaginatedFilteredTable;
