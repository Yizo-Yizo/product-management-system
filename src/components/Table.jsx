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
import { AccountCircle, AddAPhoto } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

let isEdit;
let rowID;

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
    : (a, b) => -descendingComparator(b, a, orderBy);
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
    numeric: false,
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
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('id');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editingRowId, setEditingRowId] = useState(null);
  const [selectedImage, setSelectedImage] = useState({});
  const navigate = useNavigate();

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

  const handleImageChange = (event, rowId, row) => {
    const file = event.target.files[0];
    setSelectedImage((prevSelectedImage) => ({
      ...prevSelectedImage,
      [rowId]: URL.createObjectURL(file),
    }));

    const updatedRow = { ...row, product_image: file };
    setRows((prevRows) => prevRows.map((prevRow) => (prevRow.id === rowId ? updatedRow : prevRow)));
    setFilteredRows((prevFilteredRows) =>
      prevFilteredRows.map((prevRow) => (prevRow.id === rowId ? updatedRow : prevRow))
    );
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, row) => {
    const selectedIndex = selected.indexOf(row.id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, row.id);
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
    setRows([newRow, ...rows]);
    setFilteredRows([newRow, ...filteredRows]);
    setSelected([newRow.id, ...selected]);
    setEditingRowId(newRow.id);
    setSelectedImage((prevSelectedImage) => ({
      ...prevSelectedImage,
      [newRow.id]: null,
    }));
  };

  const handleSaveRow = (row) => {

    if (isEdit === true) {
      const token = localStorage.getItem('react-demo-token');

      const formData = new FormData();
      formData.append('_method', 'PUT');

      const requestOptions = {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: token,
        },
      };

      axios
        .post(`https://app.spiritx.co.nz/api/product/${rowID}`, formData, requestOptions)
        .then((response) => {
          console.log('Edit after');
          console.log('Row edited:', response.data);

          setEditingRowId(null);

          window.location.reload();
        })
        .catch((error) => {
          console.error('Error saving row:', error);
          setEditingRowId(null);
        });
    } else {
      const category = 99;
      const isActive = 1;
      const token = localStorage.getItem('react-demo-token');

      const formData = new FormData();
      formData.append('title', row.title);
      formData.append('description', row.description);
      formData.append('price', row.price.toString());
      formData.append('is_active', isActive);
      formData.append('category_id', category.toString());
      formData.append('product_image', row.product_image);

      const requestOptions = {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: token,
        },
      };

      axios
        .post('https://app.spiritx.co.nz/api/products', formData, requestOptions)
        .then((response) => {

          console.log('Row saved:', response.data);

          setEditingRowId(null);
          window.location.reload();
          if (token) {
            props.onSignInSuccess();
            navigate('/table');
          }
        })
        .catch((error) => {
          console.error('Error saving row:', error);
          setEditingRowId(null);
        });
    }

  };

  const handleRemoveRow = (rowId) => {

    const token = localStorage.getItem('react-demo-token');

    const requestOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: token,
      },
    };

    axios
      .delete(`https://app.spiritx.co.nz/api/product/${rowId}`, requestOptions)
      .then((response) => {

        console.log(response)

        setRows((prevRows) => prevRows.filter((row) => row.id !== rowId));

        setFilteredRows((prevFilteredRows) =>
          prevFilteredRows.filter((row) => row.id !== rowId)
        );
      })
      .catch((error) => {
        console.log('Error deleting a row:', error);
      })
  };

  const handleEditRow = (rowId) => {

    setEditingRowId(rowId)

    isEdit = true;
    rowID = rowId

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
                                  ? { ...prevRow, title: value } : prevRow));
                            setFilteredRows((prevFilteredRows) =>
                              prevFilteredRows.map((prevRow) =>
                                prevRow.id === row.id ? { ...prevRow, title: value } : prevRow));
                          }} />
                      ) : (
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
                                  ? { ...prevRow, description: value } : prevRow));
                            setFilteredRows((prevFilteredRows) =>
                              prevFilteredRows.map((prevRow) =>
                                prevRow.id === row.id ? { ...prevRow, description: value } : prevRow));
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
                                prevRow.id === row.id ? { ...prevRow, price: value } : prevRow));
                            setFilteredRows((prevFilteredRows) =>
                              prevFilteredRows.map((prevRow) =>
                                prevRow.id === row.id ? { ...prevRow, price: value } : prevRow));
                          }} />
                      ) : (row.price)
                      }
                    </TableCell>
                    <TableCell align="center">
                      {editingRowId === row.id ? (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, row.id, row)}
                            style={{ display: 'none' }}
                            id={`image-input-${row.id}`}
                          />
                          <label htmlFor={`image-input-${row.id}`}>
                            {selectedImage[row.id] ? (
                              <img
                                src={selectedImage[row.id]}
                                alt={row.title}
                                style={{ width: '130px' }}
                              />
                            ) : (
                              <>
                                <AddAPhoto style={{ marginRight: '8px' }} />
                                Choose Image
                              </>
                            )}
                          </label>
                        </>
                      ) : (
                        <>
                          {row.product_image ? (
                            <img
                              src={`https://app.spiritx.co.nz/storage/${row.product_image}`}
                              alt={row.title}
                              style={{ width: '130px' }}
                            />
                          ) : (
                            'No image'
                          )}
                        </>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      {editingRowId === row.id ? (
                        <>
                          <IconButton
                            onClick={() => handleSaveRow(row)}
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