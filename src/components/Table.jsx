import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import SearchAppBar from './SearchAppBar';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Icon } from '@mui/material';


function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  {
    id: 'title',
    numeric: false,
    disablePadding: true,
    label: 'Title',
  },
  {
    id: 'description',
    numeric: false,
    disablePadding: false,
    label: 'Description',
  },
  {
    id: 'price',
    numeric: true,
    disablePadding: false,
    label: 'Price',
  },
  {
    id: 'image',
    numeric: true,
    disablePadding: false,
    label: 'Image',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={'center'}
            padding={'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align="center">
          <IconButton onClick={props.onAddRow}>
            <AddIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  onAddRow: PropTypes.func.isRequired,
};

export default function EnhancedTable(props) {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [editingRowId, setEditingRowId] = useState(null);

  useEffect(() => {
    fetch('https://app.spiritx.co.nz/api/products')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`An error occured: ${response.status}`);
        }
        return response.json()
      })
      .then((data) => {
        setRows(data);
        setFilteredRows(data); 
      })
      .catch((error) => {
        console.log(`Error tata: ${error}`);
      });
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredRows.length - page * rowsPerPage);

  const visibleRows = useMemo(
    () =>
      filteredRows
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, order, orderBy, page, rowsPerPage]
  );
  const handleSearch = (searchQuery) => {
    console.log('Inside handleSearch')
    if (!rows || rows.length === 0) {
      return;
    }
  
    try {
      const filtered = rows.filter((row) =>
        row.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRows(filtered);
    } catch (error) {
      console.log(`Error tata: ${error}`);
    }
  };

  function generateUniqueId() {
    // Generate a random alphanumeric string
    const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uniqueId = '';
  
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * alphanumeric.length);
      uniqueId += alphanumeric.charAt(randomIndex);
    }
  
    return uniqueId;
  }
  
  const handleAddRow = () => {
    const newRow = {
      id: generateUniqueId(), 
      title: '',
      description: '',
      price: 0,
      product_image: '',
    };
    setRows((prevRows) => [newRow, ...prevRows]);
    setFilteredRows((prevFilteredRows) => [newRow, ...prevFilteredRows]);
    setSelected((prevSelected) => [newRow.id, ...prevSelected]);
    setEditingRowId(newRow.id);
  };

  

  const handleSaveRow = async (row) => {
    try {

      const formData = new FormData();
      formData.append('title', row.title);
      formData.append('description', row.description);
      formData.append('price', row.price);
      formData.append('is_active', row.is_active);
      formData.append('category_id', row.category_id);
      formData.append('product_image', row.product_image);

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          token: 'your-token-value', // Replace with your actual token
        },
        body: formData,
      };
  
      fetch('https://app.spiritx.co.nz/api/products', requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`An error occurred: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('Row saved:', data);
          // Perform any additional logic after saving the row
        })
    }catch (error) {
      console.error('Error saving row:', error);
      // Handle the error appropriately
    }finally{
      setEditingRowId(null);
    }
  };

  const handleRemoveRow = () => {
    // Perfom remove row logic here

    setRows((prevRows) => prevRows.filter((row) => !selected.includes(row.id)));
    setFilteredRows((prevFilteredRows) => prevFilteredRows.filter((row) => !selected.includes(row.id)));
    setSelected([]);
  };

  const handleEditRow = (rowId) => {
    setEditingRowId(rowId)
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
      <SearchAppBar rows={rows} setFilteredRows={setFilteredRows} />
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby='tableTitle'>
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              onAddRow={handleAddRow}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell component='th' id={labelId} scope='row' padding='normal' align='center'>
                      {editingRowId === row.id ? (
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => {
                            const value = e.target.value;
                            setRows((prevRows) => 
                              prevRows.map((prevRow) => 
                                prevRow.id === row.id 
                                  ? {...prevRow, title: value } : prevRow));
                            setFilteredRows((prevFilteredRows) =>
                              prevFilteredRows.map((prevRow) =>
                                prevRow.id === row.id ? {...prevRow, title: value} : prevRow));
                          }} />
                      ): (
                        row.title
                      )}
                    </TableCell>
                    <TableCell align='center'>
                      {editingRowId === row.id ? (
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => {
                            const value = e.target.value;
                            setRows((prevRows) =>
                              prevRows.map((prevRow) =>
                                prevRow.id === row.id
                                  ? {...prevRow, description: value} : prevRow));
                            setFilteredRows((prevFilteredRows) => 
                              prevFilteredRows.map((prevRow) =>
                                prevRow.id === row.id ? {...prevRow, description: value} : prevRow));
                          }} />
                      ) : (row.description)
                      }
                    </TableCell>
                    <TableCell align='center'>
                      {editingRowId === row.id ? (
                        <input
                          type="number"
                          value={row.price}
                          onChange={(e) => {
                            const value = e.target.value;
                            setRows((prevRows) =>
                              prevRows.map((prevRow) => 
                                prevRow.id === row.id ? {...prevRow, price: value } : prevRow));
                            setFilteredRows((prevFilteredRows) => 
                              prevFilteredRows.map((prevRow) =>
                                prevRow.id === row.id ? { ...prevRow, price: value} : prevRow));
                          }} />
                      ) : (row.price)
                      }
                    </TableCell>
                    <TableCell align='center'>
                      {editingRowId === row.id ? (
                        <input
                          type="file"
                          value={row.product_image}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setRows((prevRows) =>
                                  prevRows.map((prevRow) => (prevRow.id === row.id ? { ...prevRow, product_image: reader.result } : prevRow)));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      ) : (
                        row.product_image ? (
                          <img
                            src={`https://app.spiritx.co.nz/storage/${row.product_image}`}
                            alt={row.title}
                            width='130px'
                          />
                        ) : (
                          'No image'
                        )
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingRowId === row.id ? (
                        <>
                          <IconButton
                            onClick={() => handleSaveRow(row.id)}
                            disabled={!row.title || !row.description || !row.price || !row.product_image}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton onClick={() => setEditingRowId(null)}>
                              <ClearIcon />
                            </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEditRow(row.id)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleRemoveRow(row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
