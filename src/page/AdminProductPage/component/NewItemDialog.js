import React, { useState, useEffect } from "react";
import { Form, Modal, Button, Row, Col, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CloudinaryUploadWidget from "../../../utils/CloudinaryUploadWidget";
import { CATEGORY, STATUS, SIZE } from "../../../constants/product.constants";
import "../style/adminProduct.style.css";
import {
  createProduct,
  editProduct,
  clearError,
} from "../../../features/product/productSlice";

// ✅ 이 부분을 제가 빠뜨렸습니다. 여기에 추가해주세요.
const InitialFormData = {
  name: "",
  sku: "",
  stock: {},
  image: "",
  description: "",
  category: [],
  status: "active",
  price: 0,
};

const NewItemDialog = ({ mode, showDialog, setShowDialog }) => {
  const dispatch = useDispatch();
  const { error, success, selectedProduct } = useSelector(
    (state) => state.product
  );
  const [formData, setFormData] = useState({ ...InitialFormData });
  const [stock, setStock] = useState([]);
  const [stockError, setStockError] = useState(false);

  // 생성/수정 성공 시 모달 닫기
  useEffect(() => {
    if (success) {
      setShowDialog(false);
    }
  }, [success]);

  // 모달이 열리거나 닫힐 때 상태 초기화
  useEffect(() => {
    if (showDialog) {
      if (mode === "edit" && selectedProduct) {
        setFormData(selectedProduct);
        const stockArray = Object.entries(selectedProduct.stock);
        setStock(stockArray);
      } else {
        setFormData({ ...InitialFormData });
        setStock([]);
      }
    } else {
      // 모달이 닫힐 때 form 데이터와 에러 초기화
      dispatch(clearError());
    }
  }, [showDialog, selectedProduct, mode, dispatch]);

  const handleClose = () => {
    setShowDialog(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (stock.length === 0) {
      setStockError(true);
      return;
    }
    setStockError(false);

    const totalStock = Object.fromEntries(
      stock.map(([size, quantity]) => [size, parseInt(quantity)])
    );

    if (mode === "new") {
      dispatch(createProduct({ ...formData, stock: totalStock }));
    } else {
      dispatch(editProduct({ id: formData._id, ...formData, stock: totalStock }));
    }
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  };

  const addStock = () => {
    setStock([...stock, ["", ""]]);
  };

  const deleteStock = (idx) => {
    const newStock = stock.filter((_, index) => index !== idx);
    setStock(newStock);
  };

  const handleSizeChange = (value, index) => {
    const newStock = [...stock];
    newStock[index][0] = value;
    setStock(newStock);
  };

  const handleStockChange = (value, index) => {
    const newStock = [...stock];
    newStock[index][1] = value;
    setStock(newStock);
  };

  const onHandleCategory = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      category: prev.category.includes(value)
        ? prev.category.filter((item) => item !== value)
        : [...prev.category, value],
    }));
  };

  const uploadImage = (url) => {
    setFormData({ ...formData, image: url });
  };

  return (
    <Modal show={showDialog} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{mode === "new" ? "Create New Product" : "Edit Product"}</Modal.Title>
      </Modal.Header>

      <Form className="form-container" onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="error-message">
              {error}
            </Alert>
          )}

          <Row className="mb-3">
            <Form.Group as={Col} control